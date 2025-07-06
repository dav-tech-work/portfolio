import config from '../../config/index.mjs';
import { registrar } from '../servicios/logger.mjs';

const REGEX = {
  DANGEROUS_CHARS: /[<>"'`=&/\\(){}[\];!%$#@*+,:?^~]/g,
  DANGEROUS_PATTERNS:
    /\b(?:on\w+|javascript:|data:|vbscript:|expression\(|eval\(|alert\(|document\.|window\.|localStorage\.|sessionStorage\.|indexedDB\.|XMLHttpRequest)\b/gi,
  HTML_COMMENTS: /<!--[\s\S]*?-->/g,
  URL_SAFE_CHARS: /[^\w\-/?&=.#]/g,
  SQL_INJECTION:
    /\b(?:union\s+select|insert\s+into|update\s+set|delete\s+from|drop\s+table|alter\s+table|exec\s+xp_|execute\s+sp_|select\s+.*\s+from)\b/i,
  PATH_TRAVERSAL:
    /(?:\.\.\/|\.\.\\|~\/|~\\|\/etc\/|\/var\/|\/bin\/|\/usr\/|\\windows\\|\\system32\\)/i,
  COMMAND_INJECTION: /[;&|`]/,
  DANGEROUS_COMMANDS:
    /\b(?:rm|cat|ls|whoami|id|pwd|uname|chmod|chown|sudo|su|passwd|kill|ps|netstat|curl|wget|nc|telnet|ssh|ftp|scp|rsync)\b/gi,
};

export const sanitize = {
  escapeHTML: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  text: (input, maxLength = 500) => {
    if (typeof input !== 'string') return '';
    if (REGEX.SQL_INJECTION.test(input) || REGEX.COMMAND_INJECTION.test(input)) {
      registrar(`Posible intento de inyección detectado: ${input.substring(0, 100)}`, 'warn');
    }
    // Eliminar palabras peligrosas de SQL
    const dangerousWords = [
      'DROP',
      'UNION',
      'INSERT',
      'SELECT',
      'UPDATE',
      'DELETE',
      'ALTER',
      'EXEC',
      'TRUNCATE',
      'CREATE',
      'REPLACE',
      'MERGE',
      'CALL',
      'DESCRIBE',
      'SHOW',
      'GRANT',
      'REVOKE',
      'DECLARE',
      'FETCH',
      'OPEN',
      'CLOSE',
      'PREPARE',
      'EXECUTE',
      'DEALLOCATE',
      'COMMIT',
      'ROLLBACK',
      'SAVEPOINT',
      'TRANSACTION',
      'LOCK',
      'UNLOCK',
      'KILL',
      'RENAME',
      'HANDLER',
      'LOAD',
      'DUMP',
      'FLUSH',
      'OPTIMIZE',
      'ANALYZE',
      'CHECK',
      'REPAIR',
      'BACKUP',
      'RESTORE',
      'EXPLAIN',
      'USE',
      'DATABASE',
      'TABLE',
      'VIEW',
      'INDEX',
      'KEY',
      'CONSTRAINT',
      'REFERENCES',
      'PRIMARY',
      'FOREIGN',
      'AUTO_INCREMENT',
      'CASCADE',
      'TRIGGER',
      'PROCEDURE',
      'FUNCTION',
      'EVENT',
      'SCHEDULE',
      'CURSOR',
      'OUTFILE',
      'INFILE',
      'INTO',
      'FROM',
      'WHERE',
      'HAVING',
      'GROUP',
      'ORDER',
      'BY',
      'LIMIT',
      'OFFSET',
      'VALUES',
      'SET',
      'AS',
      'IS',
      'NULL',
      'NOT',
      'AND',
      'OR',
      'XOR',
      'BETWEEN',
      'LIKE',
      'IN',
      'EXISTS',
      'ALL',
      'ANY',
      'SOME',
      'DISTINCT',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'WITH',
      'ROLLUP',
      'CUBE',
      'GROUPING',
      'SETS',
      'WINDOW',
      'OVER',
      'PARTITION',
      'RANGE',
      'ROWS',
      'CURRENT',
      'ROW',
      'FOLLOWING',
      'PRECEDING',
      'FIRST',
      'LAST',
      'NEXT',
      'PREV',
      'LEAD',
      'LAG',
      'RANK',
      'DENSE_RANK',
      'ROW_NUMBER',
      'NTILE',
      'PERCENT_RANK',
      'CUME_DIST',
      'PERCENTILE_CONT',
      'PERCENTILE_DISC',
      'JSON',
      'ARRAY',
      'STRUCT',
      'MAP',
      'UNNEST',
      'LATERAL',
      'CROSS',
      'NATURAL',
      'LEFT',
      'RIGHT',
      'FULL',
      'OUTER',
      'INNER',
      'JOIN',
      'ON',
      'USING',
      'UNION',
      'INTERSECT',
      'EXCEPT',
      'MINUS',
      'ALL',
      'ANY',
      'SOME',
      'DISTINCT',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'WITH',
      'ROLLUP',
      'CUBE',
      'GROUPING',
      'SETS',
      'WINDOW',
      'OVER',
      'PARTITION',
      'RANGE',
      'ROWS',
      'CURRENT',
      'ROW',
      'FOLLOWING',
      'PRECEDING',
      'FIRST',
      'LAST',
      'NEXT',
      'PREV',
      'LEAD',
      'LAG',
      'RANK',
      'DENSE_RANK',
      'ROW_NUMBER',
      'NTILE',
      'PERCENT_RANK',
      'CUME_DIST',
      'PERCENTILE_CONT',
      'PERCENTILE_DISC',
      'JSON',
      'ARRAY',
      'STRUCT',
      'MAP',
      'UNNEST',
      'LATERAL',
      'CROSS',
      'NATURAL',
      'LEFT',
      'RIGHT',
      'FULL',
      'OUTER',
      'INNER',
      'JOIN',
      'ON',
      'USING',
      'UNION',
      'INTERSECT',
      'EXCEPT',
      'MINUS',
      'ALL',
      'ANY',
      'SOME',
      'DISTINCT',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'WITH',
      'ROLLUP',
      'CUBE',
      'GROUPING',
      'SETS',
      'WINDOW',
      'OVER',
      'PARTITION',
      'RANGE',
      'ROWS',
      'CURRENT',
      'ROW',
      'FOLLOWING',
      'PRECEDING',
      'FIRST',
      'LAST',
      'NEXT',
      'PREV',
      'LEAD',
      'LAG',
      'RANK',
      'DENSE_RANK',
      'ROW_NUMBER',
      'NTILE',
      'PERCENT_RANK',
      'CUME_DIST',
      'PERCENTILE_CONT',
      'PERCENTILE_DISC',
      'JSON',
      'ARRAY',
      'STRUCT',
      'MAP',
      'UNNEST',
      'LATERAL',
      'CROSS',
      'NATURAL',
      'LEFT',
      'RIGHT',
      'FULL',
      'OUTER',
      'INNER',
      'JOIN',
      'ON',
      'USING',
      'UNION',
      'INTERSECT',
      'EXCEPT',
      'MINUS',
      'ALL',
      'ANY',
      'SOME',
      'DISTINCT',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'WITH',
      'ROLLUP',
      'CUBE',
      'GROUPING',
      'SETS',
      'WINDOW',
      'OVER',
      'PARTITION',
      'RANGE',
      'ROWS',
      'CURRENT',
      'ROW',
      'FOLLOWING',
      'PRECEDING',
      'FIRST',
      'LAST',
      'NEXT',
      'PREV',
      'LEAD',
      'LAG',
      'RANK',
      'DENSE_RANK',
      'ROW_NUMBER',
      'NTILE',
      'PERCENT_RANK',
      'CUME_DIST',
      'PERCENTILE_CONT',
      'PERCENTILE_DISC',
      'JSON',
      'ARRAY',
      'STRUCT',
      'MAP',
      'UNNEST',
      'LATERAL',
      'CROSS',
      'NATURAL',
      'LEFT',
      'RIGHT',
      'FULL',
      'OUTER',
      'INNER',
      'JOIN',
      'ON',
      'USING',
      'UNION',
      'INTERSECT',
      'EXCEPT',
      'MINUS',
      'ALL',
      'ANY',
      'SOME',
      'DISTINCT',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'WITH',
      'ROLLUP',
      'CUBE',
      'GROUPING',
      'SETS',
      'WINDOW',
      'OVER',
      'PARTITION',
      'RANGE',
      'ROWS',
      'CURRENT',
      'ROW',
      'FOLLOWING',
      'PRECEDING',
      'FIRST',
      'LAST',
      'NEXT',
      'PREV',
      'LEAD',
      'LAG',
      'RANK',
      'DENSE_RANK',
      'ROW_NUMBER',
      'NTILE',
      'PERCENT_RANK',
      'CUME_DIST',
      'PERCENTILE_CONT',
      'PERCENTILE_DISC',
      'JSON',
      'ARRAY',
      'STRUCT',
      'MAP',
      'UNNEST',
      'LATERAL',
      'CROSS',
      'NATURAL',
      'LEFT',
      'RIGHT',
      'FULL',
      'OUTER',
      'INNER',
      'JOIN',
      'ON',
      'USING',
      'UNION',
      'INTERSECT',
      'EXCEPT',
      'MINUS',
      'ALL',
      'ANY',
      'SOME',
      'DISTINCT',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'WITH',
      'ROLLUP',
      'CUBE',
      'GROUPING',
      'SETS',
      'WINDOW',
      'OVER',
      'PARTITION',
      'RANGE',
      'ROWS',
      'CURRENT',
      'ROW',
      'FOLLOWING',
      'PRECEDING',
      'FIRST',
      'LAST',
      'NEXT',
      'PREV',
      'LEAD',
      'LAG',
      'RANK',
      'DENSE_RANK',
      'ROW_NUMBER',
      'NTILE',
      'PERCENT_RANK',
      'CUME_DIST',
      'PERCENTILE_CONT',
      'PERCENTILE_DISC',
    ];
    let sanitized = input;
    dangerousWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    return sanitized
      .replace(REGEX.DANGEROUS_CHARS, '')
      .replace(REGEX.DANGEROUS_PATTERNS, '')
      .replace(REGEX.DANGEROUS_COMMANDS, '')
      .replace(REGEX.HTML_COMMENTS, '')
      .replace(/&#\d+;/g, '')
      .substring(0, maxLength);
  },

  html: (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    const allowedTags = [
      'p',
      'br',
      'b',
      'i',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ];
    let result = input.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
      return allowedTags.includes(tag.toLowerCase()) ? match.replace(/ .*?=(['"]).*?\1/g, '') : '';
    });
    result = result
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(REGEX.DANGEROUS_PATTERNS, '')
      .replace(REGEX.HTML_COMMENTS, '')
      .substring(0, maxLength);
    return result;
  },

  url: (url) => {
    if (typeof url !== 'string') return '';
    if (REGEX.PATH_TRAVERSAL.test(url)) {
      registrar(`Posible intento de path traversal detectado: ${url}`, 'warn');
      return '';
    }
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) return '';
      const blacklistedDomains = config.BLACKLISTED_DOMAINS;
      if (blacklistedDomains.some((domain) => urlObj.hostname.includes(domain))) return '';
      return urlObj.toString();
    } catch {
      if (url.startsWith('/') || url.startsWith('#')) {
        if (REGEX.DANGEROUS_CHARS.test(url) || REGEX.DANGEROUS_PATTERNS.test(url)) return '';
        return url.replace(REGEX.URL_SAFE_CHARS, '');
      }
      return '';
    }
  },

  json: (input, maxDepth = 5) => {
    if (typeof input === 'string') {
      try {
        input = JSON.parse(input);
      } catch {
        return null;
      }
    }
    const sanitizeValue = (value, depth = 0) => {
      if (depth > maxDepth) return null;
      if (typeof value === 'string')
        return sanitize.text(value, config.LIMITS.JSON_FIELD_LENGTH || 1000);
      if (Array.isArray(value)) {
        const maxArraySize = config.LIMITS.JSON_ARRAY_SIZE || 100;
        return value.slice(0, maxArraySize).map((v) => sanitizeValue(v, depth + 1));
      }
      if (typeof value === 'object' && value !== null) {
        const maxProps = config.LIMITS.JSON_MAX_PROPERTIES || 50;
        const entries = Object.entries(value)
          .filter(([k]) => k.length <= 50 && !['__proto__', 'constructor', 'prototype'].includes(k))
          .slice(0, maxProps)
          .map(([k, v]) => [sanitize.text(k, 50), sanitizeValue(v, depth + 1)]);
        return Object.fromEntries(entries);
      }
      return value;
    };
    return sanitizeValue(input);
  },

  filename: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[/\\:*?"<>|]/g, '')
      .replace(/\.\./g, '')
      .substring(0, 100);
  },

  email: (input) => {
    if (typeof input !== 'string') return '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(input) ? input.substring(0, 254) : '';
  },
};
