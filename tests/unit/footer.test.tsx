import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from '@/components/Footer';

describe('Footer Component', () => {
  it('deve conter o texto "Desenvolvido por " e o link apontando para https://rafaelmaciel.net/', () => {
    const html = renderToStaticMarkup(<Footer />);

    // Deve conter o texto normal "Desenvolvido por"
    expect(html).toContain('Desenvolvido por');

    // Deve conter o texto "Rafael Maciel"
    expect(html).toContain('Rafael Maciel');

    // Deve conter o link correto
    expect(html).toContain('href="https://rafaelmaciel.net/"');

    // Deve possuir target="_blank" e rel="noopener noreferrer" para segurança
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');

    // Deve possuir acessibilidade com aria-label
    expect(html).toContain('aria-label=');
  });

  it('não deve conter links ou URLs incorretas ou inventadas', () => {
    const html = renderToStaticMarkup(<Footer />);
    // Verificar que a única URL externa de desenvolvedor é https://rafaelmaciel.net/
    const hrefMatches = html.match(/href="([^"]+)"/g);
    expect(hrefMatches).toBeDefined();
    expect(hrefMatches).toContain('href="https://rafaelmaciel.net/"');
  });
});
