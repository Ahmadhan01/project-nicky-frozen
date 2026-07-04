import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                'theme-bg': 'var(--theme-bg)',
                'theme-panel': 'var(--theme-panel)',
                'theme-border': 'var(--theme-border)',
                'theme-text': 'var(--theme-text)',
                'theme-muted': 'var(--theme-muted)',
                'theme-accent': 'var(--theme-accent)',
                'theme-accent-hover': 'var(--theme-accent-hover)',
                'theme-table-header': 'var(--theme-table-header)',
                'theme-input-bg': 'var(--theme-input-bg)',
                'theme-input-border': 'var(--theme-input-border)',
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
