    <header>
        <div>
            <h1>Gestor de tareas</h1>
            <nav>
            <div class="controls-container">
                <button id="themeToggle" class="theme-toggle">
                    <span>🌙</span>
                </button>
                
                <div class="language-selector">
                    <button onclick="setLanguage('es')" class="active" data-lang="es">ES</button>
                    <button onclick="setLanguage('en')" data-lang="en">EN</button>
                    <button onclick="setLanguage('ca')" data-lang="ca">CA</button>
                    <button onclick="setLanguage('uk')" data-lang="uk">UA</button>
                </div>
            </div>
            </nav>
            <?php if ( isset($_SESSION['usuario'])) : ?>
                <div>
            <span>
                Hola, <?= $_SESSION['usuario'] ?>
            </span>
            
            <form action="controlador/logout.php" method="post">
                <button type="submit" title="Cerrar sesión"><i class="fa-solid fa-door-open"></i></button>
            </form>
                </div>

            <?php endif; ?>
        </div>      
        
    </header>