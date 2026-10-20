/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: 600,
                letterSpacing: '-0.025em',
                lineHeight: '1.05',
                marginBottom: '0.3em',
              },
              h2: {
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: '1.1',
              },
              h3: {
                fontWeight: 600,
                letterSpacing: '-0.01em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: 'var(--titolo-1)',
              },
              h2: {
                fontSize: 'var(--titolo-2)',
              },
              h3: {
                fontSize: 'var(--titolo-3)',
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: 'var(--titolo-1)',
              },
              h2: {
                fontSize: 'var(--titolo-2)',
              },
              h3: {
                fontSize: 'var(--titolo-3)',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
