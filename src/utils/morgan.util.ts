import morgan from 'morgan';
import express from 'express';

morgan.token('request_id', function getId(req: express.Request): string {
  return req.requestId;
});

morgan.token('log_type', function (): string {
  return 'http';
});

morgan.token('timestamp', function (): string {
  return new Date().toISOString();
});

export function getHttpLogger() {
  return morgan((tokens, req, res) => {
    const logObject = {
      log_type: tokens['log_type'](req, res),
      timestamp: tokens['timestamp'](req, res),
      request_id: tokens['request_id'](req, res),
      method: tokens['method'](req, res),
      'http-version': tokens['http-version'](req, res),
      url: tokens['url'](req, res),
      status: tokens['status'](req, res),
      referrer: tokens['referrer'](req, res),
      'remote-addr': tokens['remote-addr'](req, res),
      'user-agent': tokens['user-agent'](req, res),
      'response-time': tokens['response-time'](req, res),
    };
    return JSON.stringify(logObject);
  });
}
