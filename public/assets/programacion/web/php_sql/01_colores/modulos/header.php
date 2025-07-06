    <header>
        <div>
            <h1>Nuestros colores favoritos</h1>

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