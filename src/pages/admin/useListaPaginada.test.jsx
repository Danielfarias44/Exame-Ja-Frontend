import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useListaPaginada } from "./useListaPaginada";

describe("useListaPaginada", () => {
  it("carrega a primeira página e junta a próxima sem repetir itens", async () => {
    const buscar = vi.fn()
      .mockResolvedValueOnce({ itens: [{ uid: "a" }, { uid: "b" }], proximoCursor: "b" })
      .mockResolvedValueOnce({ itens: [{ uid: "b" }, { uid: "c" }], proximoCursor: null });
    const { result } = renderHook(() => useListaPaginada(buscar));
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    await act(() => result.current.carregarMais());
    expect(result.current.itens.map(({ uid }) => uid)).toEqual(["a", "b", "c"]);
    expect(buscar).toHaveBeenLastCalledWith({ cursor: "b" });
    expect(result.current.proximoCursor).toBeNull();
  });

  it("mostra erro e tenta de novo pelo recarregar", async () => {
    const buscar = vi.fn()
      .mockRejectedValueOnce(new Error("Falhou"))
      .mockResolvedValueOnce({ itens: [{ id: "d1" }], proximoCursor: null });
    const { result } = renderHook(() => useListaPaginada(buscar));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.erro).toBe("Falhou");
    act(() => result.current.recarregar());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.itens).toEqual([{ id: "d1" }]);
  });

  it("recomeça do zero quando o filtro muda e permite alterar ou remover itens", async () => {
    const buscarTodas = vi.fn().mockResolvedValue({ itens: [{ uid: "a", status: "aprovada" }, { uid: "b" }], proximoCursor: null });
    const buscarSuspensas = vi.fn().mockResolvedValue({ itens: [{ uid: "z" }], proximoCursor: null });
    const { result, rerender } = renderHook(({ buscar }) => useListaPaginada(buscar), { initialProps: { buscar: buscarTodas } });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    act(() => result.current.atualizarItem("a", (item) => ({ ...item, status: "suspensa" })));
    act(() => result.current.removerItem("b"));
    expect(result.current.itens).toEqual([{ uid: "a", status: "suspensa" }]);
    rerender({ buscar: buscarSuspensas });
    expect(result.current.status).toBe("loading");
    expect(result.current.itens).toEqual([]);
    await waitFor(() => expect(result.current.itens).toEqual([{ uid: "z" }]));
  });
});
