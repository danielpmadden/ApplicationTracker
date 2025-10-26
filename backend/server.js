import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pino from 'pino';
import pinoHttp from 'pino-http';

dotenv.config();

const app = express();
const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  base: undefined
});

app.enable('trust proxy');

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:']
      }
    },
    crossOriginEmbedderPolicy: false
  })
);
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https' &&
    !req.secure
  ) {
    res.status(400).json({ error: 'HTTPS required' });
    return;
  }
  next();
});

app.use(
  pinoHttp({
    logger,
    genReqId: () => crypto.randomUUID(),
    customSuccessMessage: () => 'ok',
    customErrorMessage: () => 'error'
  })
);

app.use(cors({ origin: false }));
app.use(express.json({ limit: '1mb' }));
app.use(compression());

const analyticsEnabled = process.env.ANALYTICS_WRITE_KEY?.length > 0;

app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (analyticsEnabled) {
    res.setHeader('X-Analytics-Enabled', '1');
  }
  next();
});

const loadJsonFile = (relativePath) => {
  const filePath = path.join(process.cwd(), relativePath);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const statusMap = loadJsonFile('config/status-map.json');
const baseCandidates = loadJsonFile('config/mock-candidates.json');

const inMemoryState = new Map();
for (const candidate of baseCandidates) {
  const stage = statusMap[candidate.status] ?? 'received';
  const [firstName, ...rest] = candidate.fullName.split(' ');
  const lastInitial = rest.length > 0 ? `${rest.pop().charAt(0)}.` : '';
  const maskedName = `${firstName} ${lastInitial}`.trim();
  inMemoryState.set(candidate.id, {
    id: candidate.id,
    name: maskedName,
    initials: maskedName
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
    role: candidate.role,
    stage,
    channel: candidate.channel,
    timeline: [
      {
        stage,
        timestamp: new Date().toISOString()
      }
    ]
  });
}

const listCandidates = () => Array.from(inMemoryState.values()).map(({ timeline, ...candidate }) => candidate);

const JWT_SECRET = process.env.JWT_SECRET || 'insecure-default';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/metrics', (_req, res) => {
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    candidates: inMemoryState.size
  };
  res.json(metrics);
});

app.get('/api/status/all', (_req, res) => {
  res.json({ candidates: listCandidates() });
});

app.get('/api/status/:candidateId', (req, res) => {
  const record = inMemoryState.get(req.params.candidateId);
  if (!record) {
    res.status(404).json({ error: 'Candidate not found' });
    return;
  }
  res.json({
    candidate: {
      id: record.id,
      name: record.name,
      initials: record.initials,
      role: record.role,
      stage: record.stage,
      channel: record.channel
    },
    timeline: record.timeline
  });
});

app.post('/api/status/:candidateId', (req, res) => {
  const { stage } = req.body ?? {};
  const allowedStages = new Set(['received', 'inReview', 'interviewing', 'offer', 'rejected']);
  if (!stage || !allowedStages.has(stage)) {
    res.status(400).json({ error: 'Missing stage' });
    return;
  }
  const record = inMemoryState.get(req.params.candidateId);
  if (!record) {
    res.status(404).json({ error: 'Candidate not found' });
    return;
  }
  record.stage = stage;
  record.timeline.push({ stage, timestamp: new Date().toISOString() });
  res.json({ ok: true });
});

app.get('/api/track', (req, res) => {
  const token = req.query.t;
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token required' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload !== 'object' || payload === null || !('candidate_id' in payload)) {
      throw new Error('Invalid payload');
    }
    const candidateId = payload.candidate_id;
    const candidate = inMemoryState.get(candidateId);
    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }
    res.json({
      candidate: {
        id: candidate.id,
        name: candidate.name,
        initials: candidate.initials,
        role: candidate.role,
        stage: candidate.stage,
        channel: candidate.channel
      },
      timeline: candidate.timeline
    });
  } catch (error) {
    req.log.error({ error }, 'invalid token');
    res.status(401).json({ error: 'Invalid token' });
  }
});

const processedEvents = new Set();

app.post('/api/webhooks/ats', (req, res) => {
  const signature = req.headers['x-ats-signature'];
  if (typeof signature !== 'string') {
    res.status(400).json({ error: 'Missing signature' });
    return;
  }
  const secret = process.env.WEBHOOK_HMAC_SECRET;
  if (!secret) {
    res.status(501).json({ error: 'Webhook secret not configured' });
    return;
  }
  const payload = JSON.stringify(req.body ?? {});
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const providedBuffer = Buffer.from(signature, 'utf-8');
  const expectedBuffer = Buffer.from(expected, 'utf-8');
  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }
  const eventId = req.body?.event_id;
  if (!eventId) {
    res.status(400).json({ error: 'Missing event_id' });
    return;
  }
  if (processedEvents.has(eventId)) {
    res.status(200).json({ ok: true, deduplicated: true });
    return;
  }
  processedEvents.add(eventId);
  res.json({ ok: true });
});

const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir, { maxAge: '1y', index: false, immutable: true }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/metrics') || req.path.startsWith('/health')) {
    next();
    return;
  }
  const indexFile = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexFile)) {
    res.status(503).send('Application is compiling');
    return;
  }
  res.sendFile(indexFile);
});

const port = Number.parseInt(process.env.PORT ?? '80', 10);

app.listen(port, () => {
  logger.info({ port }, 'server started');
});
