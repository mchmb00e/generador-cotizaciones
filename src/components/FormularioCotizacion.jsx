import { useState, useEffect } from 'react';

export default function FormularioCotizacion() {
    const [emisor, setEmisor] = useState({
        nombre: '', rut: '', responsable: '', telefono: '', email: ''
    });

    const [infoCot, setInfoCot] = useState({
        numero: '', fecha: '', validezUnidad: '', validezMedida: 'dias'
    });

    const [receptor, setReceptor] = useState({
        nombre: '', rut: '', direccion: '', telefono: '', email: ''
    });

    const [items, setItems] = useState([
        { id: Date.now(), desc: '', precio: 0, cant: 1 }
    ]);

    const [noIva, setNoIva] = useState(false);
    const [observaciones, setObservaciones] = useState('');

    const formatRut = (value) => {
        if (!value) return '';
        let rutLimpio = value.replace(/[^0-9kK]/g, '').toUpperCase();
        if (rutLimpio.length <= 1) return rutLimpio;

        const dv = rutLimpio.slice(-1);
        const cuerpo = rutLimpio.slice(0, -1);
        const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        return `${cuerpoFormateado}-${dv}`;
    };

    const formatPhone = (value) => {
        if (!value) return '';
        let digits = value.replace(/\D/g, '');
        
        if (digits.startsWith('56')) {
            digits = digits.substring(2);
        }
        
        if (digits.length === 9) {
            const codigo = digits.substring(0, 1);
            const p1 = digits.substring(1, 5);
            const p2 = digits.substring(5, 9);
            return `+56 ${codigo} ${p1} ${p2}`;
        }
        
        return value;
    };

    useEffect(() => {
        let keyBuffer = [];
        const secretCode = ['1', '2', '3', '4', ' '];

        const handleKeyDown = (event) => {
            keyBuffer.push(event.key);
            if (keyBuffer.length > 5) keyBuffer.shift();

            if (JSON.stringify(keyBuffer) === JSON.stringify(secretCode)) {
                setEmisor({
                    nombre: "ITR ELECTROSTRUK SPA",
                    rut: formatRut("783458535"), 
                    responsable: "Juan Iturriaga",
                    telefono: formatPhone("954011625"),
                    email: "juan.iturriaga.contacto@gmail.com"
                });
                setInfoCot(prev => ({ ...prev, fecha: new Date().toISOString().split('T')[0] }));
                keyBuffer = []; 
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cant), 0);
    const iva = noIva ? 0 : subtotal * 0.19;
    const total = subtotal + iva;

    const formatMoney = (amount) => '$' + Math.round(amount).toLocaleString('es-CL');

    const agregarItem = () => setItems([...items, { id: Date.now(), desc: '', precio: 0, cant: 1 }]);
    const eliminarItem = (id) => setItems(items.filter(item => item.id !== id));
    
    const actualizarItem = (id, campo, valor) => {
        setItems(items.map(item => item.id === id ? { ...item, [campo]: valor } : item));
    };

    const moverItem = (index, direccion) => {
        if ((direccion === -1 && index === 0) || (direccion === 1 && index === items.length - 1)) return;
        const nuevosItems = [...items];
        const temp = nuevosItems[index];
        nuevosItems[index] = nuevosItems[index + direccion];
        nuevosItems[index + direccion] = temp;
        setItems(nuevosItems);
    };

    const handleContinuar = () => {
        const dataToSave = {
            emisor: {
                nombre: emisor.nombre,
                rut: emisor.rut,
                encargado: emisor.responsable,
                telefono: emisor.telefono,
                email: emisor.email
            },
            receptor,
            cotizacion: {
                numero: infoCot.numero,
                fecha: infoCot.fecha,
                validez: `${infoCot.validezUnidad} ${infoCot.validezMedida}`
            },
            items: items.map((item, i) => ({
                index: i + 1,
                desc: item.desc,
                precio: item.precio,
                cant: item.cant,
                total: item.precio * item.cant
            })),
            observaciones,
            totales: {
                subtotal,
                iva: Math.round(iva),
                total: Math.round(total),
                mostrarIva: !noIva
            }
        };

        localStorage.setItem('cotizacionData', JSON.stringify(dataToSave));
        window.open(`${import.meta.env.BASE_URL}/preview`, '_blank');
    };

    return (
        <div className="border border-1 border-secondary p-0 form-width container-lg bg-white my-4">
            <h1 className="bg-body-secondary fs-2 fw-bold p-2 m-0 text-center">Generar nueva cotización</h1>
            
            <div className="p-2">
                <h2 className="fs-3">Datos del emisor</h2>
                <div className="d-flex flex-wrap flex-row align-items-center justify-content-between gap-2 mx-2">
                    <div className="input-width">
                        <label htmlFor="nombre-emisor" className="form-label fw-bold">Nombre/Razón Social:</label>
                        <input type="text" id="nombre-emisor" className="form-control border border-black" value={emisor.nombre} onChange={e => setEmisor({...emisor, nombre: e.target.value})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="rut-emisor" className="form-label fw-bold">RUT:</label>
                        <input type="text" maxLength="12" id="rut-emisor" className="form-control border border-black" value={emisor.rut} onChange={e => setEmisor({...emisor, rut: formatRut(e.target.value)})} placeholder="Ej: 12.345.678-9" />
                    </div>
                    <div className="input-width">
                        <label htmlFor="responsable-emisor" className="form-label fw-bold">Persona a Cargo:</label>
                        <input type="text" id="responsable-emisor" className="form-control border border-black" value={emisor.responsable} onChange={e => setEmisor({...emisor, responsable: e.target.value})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="telefono-emisor" className="form-label fw-bold">Teléfono:</label>
                        <input type="tel" maxLength="15" id="telefono-emisor" className="form-control border border-black" placeholder="Ej: 912345678" value={emisor.telefono} onChange={e => setEmisor({...emisor, telefono: e.target.value})} onBlur={e => setEmisor({...emisor, telefono: formatPhone(e.target.value)})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="email-emisor" className="form-label fw-bold">Correo Electrónico:</label>
                        <input type="email" id="email-emisor" className="form-control border border-black" value={emisor.email} onChange={e => setEmisor({...emisor, email: e.target.value})} />
                    </div>
                    <div className="input-width"></div>
                </div>
                <hr className="border border-2 border-black" />
            </div>

            <div className="p-2">
                <h2 className="fs-3">Información de cotización</h2>
                <div className="d-flex flex-wrap flex-row align-items-center justify-content-between gap-2 mx-2">
                    <div className="input-width">
                        <label htmlFor="numero-cotizacion" className="form-label fw-bold">Número de cotización:</label>
                        <input type="number" id="numero-cotizacion" className="form-control border border-black" value={infoCot.numero} onChange={e => setInfoCot({...infoCot, numero: e.target.value})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="fecha-cotizacion" className="form-label fw-bold">Fecha:</label>
                        <input type="date" id="fecha-cotizacion" className="form-control border border-black" value={infoCot.fecha} onChange={e => setInfoCot({...infoCot, fecha: e.target.value})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="validez-unidad" className="form-label fw-bold">Validez (Cantidad):</label>
                        <input type="number" id="validez-unidad" className="form-control border border-black" placeholder="Ej: 15" value={infoCot.validezUnidad} onChange={e => setInfoCot({...infoCot, validezUnidad: e.target.value})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="validez-medida" className="form-label fw-bold">Validez (Medida):</label>
                        <select id="validez-medida" className="form-select border border-black" value={infoCot.validezMedida} onChange={e => setInfoCot({...infoCot, validezMedida: e.target.value})}>
                            <option value="horas">Horas</option>
                            <option value="dias">Días</option>
                            <option value="semanas">Semanas</option>
                            <option value="meses">Meses</option>
                            <option value="anios">Años</option>
                        </select>
                    </div>
                </div>
                <hr className="border border-2 border-black" />
            </div>

            <div className="p-2">
                <h2 className="fs-3">Datos del receptor</h2>
                <div className="d-flex flex-wrap flex-row align-items-center justify-content-between gap-2 mx-2">
                    <div className="input-width">
                        <label htmlFor="nombre-receptor" className="form-label fw-bold">Nombre/Razón Social:</label>
                        <input type="text" id="nombre-receptor" className="form-control border border-black" value={receptor.nombre} onChange={e => setReceptor({...receptor, nombre: e.target.value})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="rut-receptor" className="form-label fw-bold">RUT:</label>
                        <input type="text" maxLength="12" id="rut-receptor" className="form-control border border-black" value={receptor.rut} onChange={e => setReceptor({...receptor, rut: formatRut(e.target.value)})} placeholder="Ej: 12.345.678-9" />
                    </div>
                    <div className="input-width">
                        <label htmlFor="direccion-receptor" className="form-label fw-bold">Dirección:</label>
                        <input type="text" id="direccion-receptor" className="form-control border border-black" value={receptor.direccion} onChange={e => setReceptor({...receptor, direccion: e.target.value})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="telefono-receptor" className="form-label fw-bold">Teléfono:</label>
                        <input type="tel" maxLength="15" id="telefono-receptor" className="form-control border border-black" placeholder="Ej: 912345678" value={receptor.telefono} onChange={e => setReceptor({...receptor, telefono: e.target.value})} onBlur={e => setReceptor({...receptor, telefono: formatPhone(e.target.value)})} />
                    </div>
                    <div className="input-width">
                        <label htmlFor="email-receptor" className="form-label fw-bold">Correo Electrónico:</label>
                        <input type="email" id="email-receptor" className="form-control border border-black" value={receptor.email} onChange={e => setReceptor({...receptor, email: e.target.value})} />
                    </div>
                    <div className="input-width"></div>
                </div>
                <hr className="border border-2 border-black" />
            </div>

            <div className="p-2">
                <h2 className="fs-3">Servicios</h2>
                <div className="table-responsive">
                    <table className="table table-bordered border-black align-middle" id="tabla-items">
                        <thead className="bg-body-secondary text-center">
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                <th>Descripción</th>
                                <th style={{ width: '150px' }}>Precio</th>
                                <th style={{ width: '120px' }}>Cantidad</th>
                                <th style={{ width: '150px' }}>Total</th>
                                <th style={{ width: '140px' }} className="action-col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="text-center fw-bold index-cell">{index + 1}</td>
                                    <td>
                                        <input type="text" className="form-control border-0 bg-transparent text-start input-desc" placeholder="Descripción" value={item.desc} onChange={(e) => actualizarItem(item.id, 'desc', e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" min="0" className="form-control border-0 text-end input-precio" value={item.precio} onChange={(e) => actualizarItem(item.id, 'precio', parseFloat(e.target.value) || 0)} />
                                    </td>
                                    <td>
                                        <input type="number" min="0" className="form-control border-0 text-center input-cantidad" value={item.cant} onChange={(e) => actualizarItem(item.id, 'cant', parseFloat(e.target.value) || 0)} />
                                    </td>
                                    <td>
                                        <input type="text" className="form-control border-0 bg-transparent text-end fw-bold input-total" value={formatMoney(item.precio * item.cant)} readOnly />
                                    </td>
                                    <td className="text-center action-col">
                                        <div className="btn-group btn-group-sm">
                                            <button type="button" className="btn btn-outline-secondary btn-up" disabled={index === 0} onClick={() => moverItem(index, -1)}>↑</button>
                                            <button type="button" className="btn btn-outline-secondary btn-down" disabled={index === items.length - 1} onClick={() => moverItem(index, 1)}>↓</button>
                                            <button type="button" className="btn btn-outline-danger btn-delete" onClick={() => eliminarItem(item.id)}>✕</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <button type="button" className="btn btn-primary" id="btn-add-item" onClick={agregarItem}>
                    + Añadir Item
                </button>
                
                <div className="row mt-4">
                    <div className="col-7">
                        <div className="form-check mb-2">
                            <input className="form-check-input border-black" type="checkbox" id="chk-no-iva" checked={noIva} onChange={(e) => setNoIva(e.target.checked)} />
                            <label className="form-check-label fw-bold" htmlFor="chk-no-iva">
                                No quiero aplicar el IVA
                            </label>
                        </div>
                        <label htmlFor="observaciones" className="form-label fw-bold">Observaciones:</label>
                        <textarea id="observaciones" className="form-control border-black" rows="4" placeholder="Ingrese observaciones aquí..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)}></textarea>
                    </div>
                    <div className="col-5">
                        <table className="table table-bordered border-black">
                            <tbody>
                                <tr>
                                    <td className="bg-body-secondary fw-bold text-end">Subtotal:</td>
                                    <td><input type="text" id="subtotal" className="form-control border-0 bg-transparent text-end" readOnly value={formatMoney(subtotal)} /></td>
                                </tr>
                                <tr>
                                    <td className="bg-body-secondary fw-bold text-end">IVA (19%):</td>
                                    <td>
                                        <input type="text" id="iva" className="form-control border-0 bg-transparent text-end" style={{ textDecoration: noIva ? 'line-through' : 'none', color: noIva ? '#999' : 'black' }} readOnly value={formatMoney(iva)} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="bg-body-secondary fw-bold text-end">Total:</td>
                                    <td><input type="text" id="total-final" className="form-control border-0 bg-transparent fw-bold text-end fs-5" readOnly value={formatMoney(total)} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <hr className="border border-2 border-black" />
            </div>
            
            <div className="p-2 pb-4 no-print text-center">
                <div className="d-flex flex-row align-items-center justify-content-center gap-2">
                    <button className="btn btn-warning" onClick={handleContinuar}>Continuar y Previsualizar</button>
                </div>
            </div>
        </div>
    );
}