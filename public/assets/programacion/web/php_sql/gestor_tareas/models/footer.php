<footer class="site-footer" role="contentinfo">
    <div class="footer-content">
  
      <div class="footer-left">
        <p>&copy; 2025 Daniel Arribas Velázquez</p>
      </div>
  
      <div class="footer-right">
        <a href="https://github.com/dav-tech-work" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <i class="fab fa-github" aria-hidden="true"></i>
        </a>
        <a href="https://linkedin.com/in/daniel-arribas-velazquez" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <i class="fab fa-linkedin" aria-hidden="true"></i>
        </a>
      </div>
  
    </div>

    <!-- FullCalendar -->
    <script type="module">
        // Cargar FullCalendar como módulos ES
        import { Calendar } from 'https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.10/index.min.js';
        import dayGridPlugin from 'https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.10/index.global.min.js';
        import interactionPlugin from 'https://cdn.jsdelivr.net/npm/@fullcalendar/interaction@6.1.10/index.global.min.js';
        import allLocales from 'https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.10/locales-all.min.js';

        // Hacer que FullCalendar esté disponible globalmente
        window.Calendar = Calendar;
        window.dayGridPlugin = dayGridPlugin;
        window.interactionPlugin = interactionPlugin;
        window.allLocales = allLocales;
    </script>
    
    <!-- Punto de entrada principal de JavaScript -->
    
  </footer>