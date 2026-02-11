import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HymnListPage } from '../pages/HymnListPage';
import type { HymnIndexEntry } from '@/core/types';

/** Mock del módulo del repositorio */
vi.mock('@/core/repository', () => ({
  hymnRepository: {
    getIndex: vi.fn(),
    getById: vi.fn(),
  },
}));

/** Importar el mock después de vi.mock */
import { hymnRepository } from '@/core/repository';

const mockHymns: HymnIndexEntry[] = [
  { id: 'h001', title: 'Sublime Gracia', author: 'John Newton', file: 'h001.json' },
  { id: 'h002', title: 'Castillo Fuerte', author: 'Martín Lutero', file: 'h002.json' },
  { id: 'h003', title: 'Grande Es Tu Fidelidad', file: 'h003.json' },
];

function renderHymnList() {
  return render(
    <MemoryRouter>
      <HymnListPage />
    </MemoryRouter>
  );
}

describe('HymnListPage', () => {
  let getIndexMock: MockedFunction<typeof hymnRepository.getIndex>;

  beforeEach(() => {
    vi.clearAllMocks();
    getIndexMock = hymnRepository.getIndex as MockedFunction<typeof hymnRepository.getIndex>;
    getIndexMock.mockResolvedValue(mockHymns);
  });

  it('muestra indicador de carga inicialmente', () => {
    renderHymnList();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra todos los himnos después de cargar', async () => {
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
    });

    expect(screen.getByText('Castillo Fuerte')).toBeInTheDocument();
    expect(screen.getByText('Grande Es Tu Fidelidad')).toBeInTheDocument();
  });

  it('muestra el autor cuando existe', async () => {
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('John Newton')).toBeInTheDocument();
    });

    expect(screen.getByText('Martín Lutero')).toBeInTheDocument();
  });

  it('no muestra autor para himnos sin autor', async () => {
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('Grande Es Tu Fidelidad')).toBeInTheDocument();
    });

    // "Grande Es Tu Fidelidad" no tiene autor, no debe aparecer texto de autor para ese himno
    const hymnCard = screen.getByText('Grande Es Tu Fidelidad').closest('a');
    expect(hymnCard).not.toBeNull();
  });

  it('filtra himnos por título parcial', async () => {
    const user = userEvent.setup();
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'gracia');

    await waitFor(() => {
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
      expect(screen.queryByText('Castillo Fuerte')).not.toBeInTheDocument();
      expect(screen.queryByText('Grande Es Tu Fidelidad')).not.toBeInTheDocument();
    });
  });

  it('filtra ignorando tildes: "grande" encuentra "Grande Es Tu Fidelidad"', async () => {
    const user = userEvent.setup();
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('Grande Es Tu Fidelidad')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'grande');

    await waitFor(() => {
      expect(screen.getByText('Grande Es Tu Fidelidad')).toBeInTheDocument();
      expect(screen.queryByText('Sublime Gracia')).not.toBeInTheDocument();
    });
  });

  it('filtra case-insensitive: "SUBLIME" encuentra "Sublime Gracia"', async () => {
    const user = userEvent.setup();
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'SUBLIME');

    await waitFor(() => {
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
      expect(screen.queryByText('Castillo Fuerte')).not.toBeInTheDocument();
    });
  });

  it('muestra estado vacío cuando la búsqueda no tiene resultados', async () => {
    const user = userEvent.setup();
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'zzznomatch');

    await waitFor(() => {
      expect(screen.queryByText('Sublime Gracia')).not.toBeInTheDocument();
      expect(screen.queryByText('Castillo Fuerte')).not.toBeInTheDocument();
    });
  });

  it('muestra mensaje de error cuando falla la carga', async () => {
    getIndexMock.mockRejectedValue(new Error('Error de red'));

    renderHymnList();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Error de red')).toBeInTheDocument();
  });

  it('limpia la búsqueda al hacer clic en el botón limpiar', async () => {
    const user = userEvent.setup();
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'gracia');

    const clearButton = screen.getByRole('button', { name: /limpiar/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
      expect(screen.getByText('Castillo Fuerte')).toBeInTheDocument();
    });
  });

  it('los himnos están ordenados alfabéticamente', async () => {
    // El mock devuelve en orden: Sublime, Castillo, Grande
    // Deben aparecer ordenados: Castillo, Grande, Sublime
    renderHymnList();

    await waitFor(() => {
      expect(screen.getByText('Sublime Gracia')).toBeInTheDocument();
    });

    const links = screen.getAllByRole('link').filter(
      (link) => link.getAttribute('href')?.startsWith('/hymn/') === true
    );

    expect(links[0]).toHaveAccessibleName(expect.stringContaining('Castillo Fuerte'));
    expect(links[1]).toHaveAccessibleName(expect.stringContaining('Grande Es Tu Fidelidad'));
    expect(links[2]).toHaveAccessibleName(expect.stringContaining('Sublime Gracia'));
  });
});
