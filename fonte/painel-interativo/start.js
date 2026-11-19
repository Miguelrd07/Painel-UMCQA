// ===== início =====
FR = filtra(); pintaFiltros();
if (!location.hash) history.replaceState(null, '', '#/geral');
rota();
