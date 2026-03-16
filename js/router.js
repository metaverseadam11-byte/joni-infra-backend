// Simple client-side router
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial load
        window.addEventListener('load', () => this.handleRoute());

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const hash = e.target.getAttribute('href');
                window.location.hash = hash;
            }
        });
    }

    register(path, handler) {
        this.routes.set(path, handler);
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const route = hash.split('?')[0]; // Remove query params
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${route}`) {
                link.classList.add('active');
            }
        });

        // Update active page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const activePage = document.getElementById(route);
        if (activePage) {
            activePage.classList.add('active');
            
            // Call route handler if registered
            const handler = this.routes.get(route);
            if (handler) {
                handler();
            }

            // Scroll to top
            window.scrollTo(0, 0);
        }

        this.currentRoute = route;
    }

    navigate(path) {
        window.location.hash = path;
    }
}

// Export router instance
const router = new Router();
