import { useEffect, useState } from "react";
import { Button, Grid, Popover, Typography } from "@mui/material";
import MaterialTable from "@material-table/core";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

const dividirFecha = function (date) {
  if (date !== undefined) {
    if (date !== null) {
      var arr1 = date.split("-");
      if (arr1.length === 1) return date;
      var arr2 = arr1[2].split("T");
      return arr2[0] + "/" + arr1[1] + "/" + arr1[0];
    }
  }
};

function App() {
  const [facturas, setFacturas] = useState([]);
  const [general, setGeneral] = useState({isLoading: false, isError: true, messageError: ""});
  const [newWork, setNewWork] = useState({nit: "", cliente: "", cantidad: "", precio: "", total: "", producto: ""});
  const [datosFacturaGuardar, setDatosFactura] = useState({nitCliente: "", cliente: ""});
  const [clientes] = useState([{id: 1, nombre: "Juan Pablo"}, {id: 2, nombre: "Quillermo Juarez"}, { id: 3, nombre: "Omar vicente"}, {id: 4, nombre: "Cristian Godinez"}])
  const [datosDeFactura, setDatosDeFactura] = useState({});
  const [mostrarGuardarFactura, setMostrarGuardarFactura] = useState(true);

  useEffect( () => {
    getData()
  }, [])

  const getData = async () => {
    try {
      setGeneral({isLoading: true, isError: false, messageError: ""})
      const response = await fetch('http://localhost:8082/facturas')
      const data = await response.json();

      if(data?.error) {
        return setGeneral({isLoading: false, isError: true, messageError: data.error})
      }

      setGeneral({isLoading: false, isError: false, messageError: ""})
      setFacturas(data);
    } catch (error) {
      setGeneral({isLoading: false, isError: true, messageError: error.response})
    }
  }

  const {isLoading, isError, messageError } = general;

  if(isLoading){
    return (
      <h1>cargando datos....!</h1>
    )
  }

  if(!isLoading && isError) {
      return (
      <div class="alert alert-danger" role="alert">
        {messageError}
      </div>
    )
  }

  // GUARDAR FACTURA
  const guadarFactura = async () => {
    const {nitCliente, cliente} = datosFacturaGuardar;
    const clienteEncontrado = clientes.find( ({id}) => Number(id) === Number(cliente));

    const objetoAEnviar = {
      "clienteId": clienteEncontrado?.id || "",
      "correlativo": facturas.length + 1,
      "facturaId": facturas.length + 1,
      "fecha": new Date(),
      nit: nitCliente,
      "nombre": clienteEncontrado?.nombre|| "",
      "total": 0
    }

    try {
      setGeneral({isLoading: true, isError: false, messageError: ""})
      const response = await fetch('http://localhost:8082/facturas/facturas', {
        method: "POST",
        headers: {"Content-type": "application/json;charset=UTF-8"},
        body: JSON.stringify(objetoAEnviar)
      })

      if(response?.error) {
        return setGeneral({isLoading: false, isError: true, messageError: response?.error || "Inconvenientes al guardar la factura"})
      }

      setGeneral({isLoading: false, isError: false, messageError: ""})
      getData();

    } catch (error) {
      setGeneral({isLoading: false, isError: true, messageError: error.response})
    }
  }

  // ELIMINAR FACTURA
  const eliminarFactura = async (facturaId) => {
    try {
      setGeneral({isLoading: true, isError: false, messageError: ""})
      const response = await fetch(`http://localhost:8082/facturas/facturas/${facturaId}`, {
        method: "DELETE",
        headers: {"Content-type": "application/json;charset=UTF-8"},
      })

      if(response?.error) {
        return setGeneral({isLoading: false, isError: true, messageError: response?.error || "Inconvenientes al eliminar la"})
      }

      setGeneral({isLoading: false, isError: false, messageError: ""})
      getData();

    } catch (error) {
      setGeneral({isLoading: false, isError: true, messageError: error.response})
    }
  }

  // DETALLE DE FACTURA
  const saveData = async () => {
    const {cantidad, precio, producto} = newWork;

    const { clienteId, correlativo, facturaId, nit, nombre } =  datosDeFactura

    const objetoAEnviar = {
      cantidad: Number(cantidad),
      "detalleId": 0,
      "factura": {
        "clienteId": clienteId || "",
        "correlativo": correlativo,
        "facturaId": facturaId,
        "fecha": new Date(),
        nit,
        "nombre": nombre|| "",
        "total": Number(cantidad) * Number(precio)
      },
      facturaId: facturaId,
      "montoTotal": Number(cantidad) * Number(precio),
      "producto": producto
    }

    try {
      setGeneral({isLoading: true, isError: false, messageError: ""})
      const response = await fetch('http://localhost:8082/detallesfactura',  {
        method: "POST",
        headers: {"Content-type": "application/json;charset=UTF-8"},
        body: JSON.stringify(objetoAEnviar)
      })

      if(response?.error) {
        return setGeneral({isLoading: false, isError: true, messageError: response?.error || "Inconvenientes al guardar la factura"})
      }

      setGeneral({isLoading: false, isError: false, messageError: ""})
      getData();

    } catch (error) {
      setGeneral({isLoading: false, isError: true, messageError: error.response})
    }
  }

const mostrarGuardarDatos = () => {
  setMostrarGuardarFactura(true);
}

const obtenerDatosFactura = (data) => {
  const { clienteId, correlativo, facturaId, nit, nombre } =  data
  setDatosDeFactura({clienteId, correlativo, facturaId, nit, nombre});
}

  return (
    <div className="">
        <div className="container mt-5">
          <h2 className="modal-title text-center text-text-uppercase mb-5 text-bg-secondary" id="exampleModalLabel">Ventas online MR Keyvin</h2>

          <Grid container spacing={2} >
              <Grid item xs={2}>
                <button type="button" className="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#factura" onClick={() => mostrarGuardarDatos()}> Nueva factura </button>
              </Grid>
          </Grid>
          <div className="mt-3">
            <MaterialTable
              title="Listado de facturas"
              columns={[
                { title: 'Nit', field: 'nit' },
                { title: 'Nombre', field: 'nombre', type: 'numeric' },
                { title: 'Correlativo', field: 'correlativo', type: 'numeric' },
                { title: 'Total', field: 'total', type: 'numeric' },
                { title: 'Fecha de creación', field: 'fecha', render: (rowData) => dividirFecha(rowData?.fecha || "")},
                { title: 'Detalle', field: 'fecha', render: (rowData) =>
                  <button style={{fontSize: 16, padding: 2}} type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#detalleFactura" onClick={() => obtenerDatosFactura(rowData)}> Detalle Factura </button>
              },
                { title: 'Eliminar', field: 'fecha', render: (rowData) =>
                <button type="button" className="btn-close" data-bs-toggle="modal" data-bs-target="#eliminarFactura" onClick={() => obtenerDatosFactura(rowData)} ></button>}
              ]}
              data={facturas}
              actions={[]}
            />
          </div>
        </div>

            {/* FACTURAS */}
            <div className="modal fade" id="eliminarFactura" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Formulario para eliminar factura</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
              <form>
              <h4 className="modal-title" id="exampleModalLabel">¿Está seguro de eliminar la factura No. {datosDeFactura?.facturaId || ""} ?</h4>
              <h5 className="modal-title" id="exampleModalLabel">No podrá revertir esta acción!</h5>
              </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">No, Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={() => eliminarFactura(datosDeFactura.facturaId)} data-bs-dismiss="modal" >Sí, Guardar datos</button>
              </div>
            </div>
          </div>
        </div>

        {/* FACTURAS */}
          <div className="modal fade" id="factura" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Formulario para nueva factura</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
              <form>
              <div className="mb-3">
                  <label htmlFor="factura" className="form-label">No. de factura</label>
                  <input placeholder="No. de factura" type="text" className="form-control" id="factura" value={facturas?.length + 1 || ""} disabled/>
                </div>
                <div className="mb-3">
                  <label htmlFor="cliente" className="form-label">Nombre del cliente</label>
                  <input placeholder="Nombre del cliente" type="text" className="form-control" id="cliente" value={facturas?.length + 1|| ""} disabled/>
                </div>
                <div className="mb-3">
                  <label htmlFor="nitCliente" className="form-label">Nit: *</label>
                  <input placeholder="Ingrese el nit sin guiones (ejemplo: 8989898)" onChange={(event) => setDatosFactura({...datosFacturaGuardar, nitCliente: event.target.value})} type="text" className="form-control" id="nitCliente" aria-describedby="nitCliente" />
                </div>
                <div className="mb-3">
                  <label htmlFor="cliente" className="form-label">Cliente: *</label>
                  <select class="form-select" aria-label="Default select example" onChange={(event) => setDatosFactura({...datosFacturaGuardar, cliente: event.target.value})} id="cliente">
                    <option value={0}>Seleccione un cliente</option>
                    {clientes.length > 0 ? clientes.map( ({id, nombre}) => (
                      <option value={id}>{nombre}</option>
                    )) : (
                      <option selected>No hay clientes registrados</option>
                    )}
                  </select>
                </div>
              </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={guadarFactura} data-bs-dismiss="modal" >Guardar datos</button>
              </div>
            </div>
          </div>
        </div>

        {/* DETALLE FACTURA  */}

        <div className="modal fade" id="detalleFactura" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Formulario detalle factura</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
              <form>
              <div className="mb-3">
                  <label htmlFor="factura" className="form-label">No. de factura</label>
                  <input placeholder="No. de factura" type="text" className="form-control" id="factura" value={datosDeFactura?.facturaId || ""} disabled/>
                </div>
                <div className="mb-3">
                  <label htmlFor="cliente" className="form-label">Nombre del cliente</label>
                  <input placeholder="Nombre del cliente" type="text" className="form-control" id="cliente" value={datosDeFactura?.nombre || ""} disabled/>
                </div>
                <div className="mb-3">
                  <label htmlFor="nit" className="form-label">Nit: *</label>
                  <input placeholder="Nit" type="text" className="form-control" id="nit" aria-describedby="emailHelp" value={datosDeFactura?.nit || ""} disabled />
                </div>
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">Detalle de factura</h5>
                </div>
                <div className="mb-3">
                  <label htmlFor="producto" className="form-label">Producto: *</label>
                  <input placeholder="Ingrese el nombre del producto" onChange={(event) => setNewWork({...newWork, producto: event.target.value})} type="text" className="form-control" id="producto"  />
                </div>
                <div className="mb-3">
                  <label htmlFor="cantidad" className="form-label">Cantidad: *</label>
                  <input onChange={(event) => setNewWork({...newWork, cantidad: event.target.value})} type="number" className="form-control" id="cantidad" />
                </div>
                <div className="mb-3">
                  <label htmlFor="precio" className="form-label">Precio: *</label>
                  <input onChange={(event) => setNewWork({...newWork, precio: event.target.value})} type="number" className="form-control" id="precio" />
                </div>
              </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={saveData} data-bs-dismiss="modal" >Guardar datos</button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

export default App;
