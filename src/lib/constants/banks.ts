export const BANKS = [
	{ id: '0102', name: 'Banco de Venezuela' },
	{ id: '0104', name: 'Venezolano de Crédito' },
	{ id: '0105', name: 'Mercantil Banco' },
	{ id: '0108', name: 'BBVA Provincial' },
	{ id: '0114', name: 'Bancaribe' },
	{ id: '0115', name: 'Exterior' },
	{ id: '0128', name: 'Banco Caroní' },
	{ id: '0138', name: 'Banco Plaza' },
	{ id: '0151', name: 'BFC Banco Fondo Común' },
	{ id: '0156', name: '100% Banco' },
	{ id: '0163', name: 'Banco del Tesoro' },
	{ id: '0168', name: 'Bancrecer' },
	{ id: '0169', name: 'R4 Banco' },
	{ id: '0171', name: 'Banco Activo' },
	{ id: '0172', name: 'Bancamiga' },
	{ id: '0174', name: 'Banplus' },
	{ id: '0175', name: 'Banco Bicentenario' },
	{ id: '0191', name: 'BNC (Banco Nacional de Crédito)' },
	{ id: '0001', name: 'Banco Central de Venezuela (BCV)' },
	{ id: '0201', name: 'Banky' },
];

export const getBankName = (id: string) => {
	const bank = BANKS.find((b) => b.id === id);
	return bank ? bank.name : 'Banco Desconocido';
};
