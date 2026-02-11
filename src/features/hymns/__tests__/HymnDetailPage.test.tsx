import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HymnDetailPage } from '../pages/HymnDetailPage';
import type { Hymn } from '@/core/types';
import {
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
  FONT_SIZE_KEY,
} from '@/core/storage';

/** Mock del módulo del repositorio */
vi.mock('@/core/repository', () => ({
  hymnRepository: {
    getIndex: vi.fn(),
    getById: vi.fn(),
  },
}));

import { hymnRepository } from '@/core/repository';

const mockHymn: Hymn = {
  id: 'h001',
  title: 'Sublime Gracia',
  author: 'John Newton',
  content: 'Verso 1\nVerso 2\n\nVerso 3',
  createdAt: '2024-01-15T00:00:00.000Z',
};

const mockHymnNoAuthor: Hymn = {
  id: 'h002',
  title: 'Himno Sin Autor',
  content: 'Solo contenido',
};

function renderHymnDetail(id = 'h001') {
  return render(
    <MemoryRouter initialEntries={[`/hymn/${id}`]}>
      <Routes>
        <Route path="/hymn/:id" element={<HymnDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('HymnDetailPage', () => {
  let getByIdMock: MockedFunction<typeof hymnRepository.getById>;
  let getIndexMock: MockedFunction<typeof hymnRepository.getIndex>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getByIdMock = hymnRepository.getById as MockedFunction<typeof hymnRepository.getById>;
    getIndexMock = hymnRepository.getIndex as MockedFunction<typeof hymnRepository.getIndex>;
    getByIdMock.mockResolvedValue(mockHymn);
    getIndexMock.mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('muestra indicador de carga inicialmente', () => {
    renderHymnDetail();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el título del himno', async () => {
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sublime Gracia' })).toBeInTheDocument();
    });
  });

  it('muestra el autor cuando existe', async () => {
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText('John Newton')).toBeInTheDocument();
    });
  });

  it('no muestra el autor cuando no existe', async () => {
    getByIdMock.mockResolvedValue(mockHymnNoAuthor);
    renderHymnDetail('h002');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Himno Sin Autor' })).toBeInTheDocument();
    });

    expect(screen.queryByText('John Newton')).not.toBeInTheDocument();
  });

  it('muestra la letra del himno', async () => {
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error cuando falla la carga', async () => {
    getByIdMock.mockRejectedValue(new Error('Himno no encontrado'));

    renderHymnDetail('no-existe');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Himno no encontrado')).toBeInTheDocument();
  });

  it('usa el tamaño de fuente por defecto al cargar', async () => {
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const content = screen.getByText(/Verso 1/);
    expect(content).toHaveStyle({ fontSize: `${String(FONT_SIZE_DEFAULT)}px` });
  });

  it('aumenta el tamaño de fuente al hacer clic en A+', async () => {
    const user = userEvent.setup();
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const increaseBtn = screen.getByRole('button', { name: /aumentar tamaño/i });
    await user.click(increaseBtn);

    const content = screen.getByText(/Verso 1/);
    expect(content).toHaveStyle({ fontSize: `${String(FONT_SIZE_DEFAULT + FONT_SIZE_STEP)}px` });
  });

  it('disminuye el tamaño de fuente al hacer clic en A-', async () => {
    const user = userEvent.setup();
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const decreaseBtn = screen.getByRole('button', { name: /disminuir tamaño/i });
    await user.click(decreaseBtn);

    const content = screen.getByText(/Verso 1/);
    expect(content).toHaveStyle({ fontSize: `${String(FONT_SIZE_DEFAULT - FONT_SIZE_STEP)}px` });
  });

  it('no supera el tamaño máximo al hacer clic en A+ repetidamente', async () => {
    const user = userEvent.setup();
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const increaseBtn = screen.getByRole('button', { name: /aumentar tamaño/i });

    // Hacer clic muchas veces más allá del máximo
    for (let i = 0; i < 20; i++) {
      await user.click(increaseBtn);
    }

    const content = screen.getByText(/Verso 1/);
    expect(content).toHaveStyle({ fontSize: `${String(FONT_SIZE_MAX)}px` });
  });

  it('no baja del tamaño mínimo al hacer clic en A- repetidamente', async () => {
    const user = userEvent.setup();
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const decreaseBtn = screen.getByRole('button', { name: /disminuir tamaño/i });

    // Hacer clic muchas veces más allá del mínimo
    for (let i = 0; i < 20; i++) {
      await user.click(decreaseBtn);
    }

    const content = screen.getByText(/Verso 1/);
    expect(content).toHaveStyle({ fontSize: `${String(FONT_SIZE_MIN)}px` });
  });

  it('deshabilita el botón A- cuando está en el mínimo', async () => {
    const user = userEvent.setup();
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const decreaseBtn = screen.getByRole('button', { name: /disminuir tamaño/i });

    // Ir al mínimo
    for (let i = 0; i < 10; i++) {
      await user.click(decreaseBtn);
    }

    expect(decreaseBtn).toBeDisabled();
  });

  it('deshabilita el botón A+ cuando está en el máximo', async () => {
    const user = userEvent.setup();
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const increaseBtn = screen.getByRole('button', { name: /aumentar tamaño/i });

    // Ir al máximo
    for (let i = 0; i < 10; i++) {
      await user.click(increaseBtn);
    }

    expect(increaseBtn).toBeDisabled();
  });

  it('persiste el tamaño de fuente en localStorage', async () => {
    const user = userEvent.setup();
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const increaseBtn = screen.getByRole('button', { name: /aumentar tamaño/i });
    await user.click(increaseBtn);

    expect(localStorage.getItem(FONT_SIZE_KEY)).toBe(
      String(FONT_SIZE_DEFAULT + FONT_SIZE_STEP)
    );
  });

  it('restaura el tamaño de fuente desde localStorage al montar', async () => {
    // Guardar un tamaño previo
    localStorage.setItem(FONT_SIZE_KEY, '22');

    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const content = screen.getByText(/Verso 1/);
    expect(content).toHaveStyle({ fontSize: '22px' });
  });

  it('resetea el tamaño al hacer clic en Reset', async () => {
    const user = userEvent.setup();
    localStorage.setItem(FONT_SIZE_KEY, '24');
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /restablecer/i });
    await user.click(resetBtn);

    const content = screen.getByText(/Verso 1/);
    expect(content).toHaveStyle({ fontSize: `${String(FONT_SIZE_DEFAULT)}px` });
  });

  it('tiene enlace de volver a la lista de himnos', async () => {
    renderHymnDetail();

    await waitFor(() => {
      expect(screen.getByText(/Verso 1/)).toBeInTheDocument();
    });

    // aria-label del enlace es "Volver a la lista de himnos"
    const backLink = screen.getByRole('link', { name: /volver a la lista de himnos/i });
    expect(backLink).toHaveAttribute('href', '/');
  });
});
