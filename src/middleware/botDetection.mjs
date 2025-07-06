import { registrar } from '../utils/servicios/logger.mjs';

// Lista de user agents maliciosos conocidos
const maliciousUserAgents = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /python-requests/i,
  /curl/i,
  /burp/i,
  /zap/i,
  /w3af/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /metasploit/i,
  /hydra/i,
  /john/i,
  /hashcat/i,
  /aircrack/i,
  /kismet/i,
  /wireshark/i,
  /tcpdump/i,
];

export default function botDetectionMiddleware(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';

  // Log para debugging
  registrar(`User agent recibido: ${userAgent}`, 'info');

  // Verificar si el user agent coincide con patrones maliciosos
  const isMalicious = maliciousUserAgents.some((pattern) => pattern.test(userAgent));

  if (isMalicious) {
    registrar(`Bot malicioso detectado: ${userAgent} desde ${req.ip}`, 'warn');
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Tu solicitud ha sido bloqueada por motivos de seguridad',
    });
  }

  next();
}
