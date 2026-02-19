import { useState, useEffect } from 'react';

export default function PreviewCotizacion() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const dataStr = localStorage.getItem('cotizacionData');
        if (dataStr) {
            const parsedData = JSON.parse(dataStr);
            setData(parsedData);
            document.title = `Cotizacion_${parsedData.cotizacion.numero || 'Nueva'}`;
        }
    }, []);

    const formatRut = (r) => {
        if (!r) return '';
        let v = r.replace(/[^0-9kK]/g, '');
        if (v.length < 2) return r;
        return v.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '-' + v.slice(-1).toUpperCase();
    };

    const formatPhone = (p) => {
        if (!p) return '';
        let v = p.replace(/\D/g, '');
        if (v.length === 9 && v.startsWith('9')) return `+56 9 ${v.substring(1, 5)} ${v.substring(5)}`;
        if (v.length === 11 && v.startsWith('569')) return `+56 9 ${v.substring(3, 7)} ${v.substring(7)}`;
        return p;
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const formatFecha = (f) => {
        if (!f) return '';
        if (f.includes('-')) {
            const p = f.split('-');
            return `${p[2]}/${p[1]}/${p[0]}`;
        }
        return f;
    };

    if (!data) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando cotización o no hay datos guardados...</div>;
    }

    return (
        <>
            <div id="contenido-pdf">
                <div className="main-title">COTIZACIÓN</div>

                <div className="header-section">
                    <div className="header-left">
                        <div className="data-line"><span className="label">Nombre/Razón Social:</span> <span>{data.emisor.nombre}</span></div>
                        <div className="data-line"><span className="label">RUT:</span> <span>{formatRut(data.emisor.rut)}</span></div>
                        <br />
                        <div className="data-line"><span className="label">Persona a Cargo:</span> <span>{data.emisor.encargado}</span></div>
                        <div className="data-line"><span className="label">Teléfono:</span> <span>{formatPhone(data.emisor.telefono)}</span></div>
                        <div className="data-line"><span className="label">Correo Electrónico:</span> <span>{data.emisor.email}</span></div>
                    </div>
                    
                    <div className="header-right">
                        <div className="data-line"><span className="label">COTIZACIÓN Nº</span> <span style={{ fontWeight: 'normal' }}>{data.cotizacion.numero}</span></div>
                        <br />
                        <div className="data-line"><span className="label">Fecha:</span> <span>{formatFecha(data.cotizacion.fecha)}</span></div>
                        <div className="data-line"><span className="label">Validez de la cotización:</span> <span>{data.cotizacion.validez}</span></div>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="receptor-section">
                    <div className="data-line"><span className="label">Nombre/Razón Social:</span> <span>{data.receptor.nombre}</span></div>
                    <div className="data-line"><span className="label">RUT:</span> <span>{formatRut(data.receptor.rut)}</span></div>
                    <div className="data-line"><span className="label">Dirección:</span> <span>{data.receptor.direccion}</span></div>
                    <div className="data-line"><span className="label">Teléfono:</span> <span>{formatPhone(data.receptor.telefono)}</span></div>
                    <div className="data-line"><span className="label">Correo Electrónico:</span> <span>{data.receptor.email}</span></div>
                </div>

                <div className="detail-separator">
                    <span>Detalle</span>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th width="8%">#</th>
                            <th width="40%">Descripción</th>
                            <th width="12%">Cantidad</th>
                            <th width="20%">Precio</th>
                            <th width="20%">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item) => (
                            <tr key={item.index}>
                                <td>{item.index}</td>
                                <td>{item.desc}</td>
                                <td>{item.cant}</td>
                                <td>{formatMoney(item.precio)}</td>
                                <td>{formatMoney(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="totals-section">
                    <div className="total-row"><span className="label">Subtotal:</span> <span>{formatMoney(data.totales.subtotal)}</span></div>
                    
                    {data.totales.mostrarIva && (
                        <div className="total-row">
                            <span className="label">IVA (19%):</span> <span>{formatMoney(data.totales.iva)}</span>
                        </div>
                    )}
                    
                    <div className="total-row total-final"><span className="label">Total:</span> <span>{formatMoney(data.totales.total)}</span></div>
                </div>
                
                <div className="obs-section">
                    <span className="label">Observaciones:</span> <span>{data.observaciones}</span>
                </div>
            </div>

            <button className="fab no-print" onClick={() => window.print()}>Descargar | Imprimir</button>
        </>
    );
}