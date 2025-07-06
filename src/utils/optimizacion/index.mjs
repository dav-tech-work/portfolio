import {
  configurarCompresion,
  compresionEstaticos,
  compresionAPI,
  compresionInteligente,
  compresionPorEntorno,
  detectarCompresion,
} from './compression.mjs';
import { minificarHTML } from './htmlMinifier.mjs';
import { medirTiempoEjecucion } from './tiempoEjecucion.mjs';

export {
  configurarCompresion,
  compresionEstaticos,
  compresionAPI,
  compresionInteligente,
  compresionPorEntorno,
  detectarCompresion,
  minificarHTML,
  medirTiempoEjecucion,
};
