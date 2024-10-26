import { db } from './db.js'

class Carrito {
    
    constructor() {
    //Variable que mantiene el estado visible del carrito (Global)
      this.carritoVisible = this.hacerVisibleCarrito()
      this.items = this.cargarLocalStorage()
      this.inicializarEventos();
    }
    //Espermos que todos los elementos de la pàgina cargen para ejecutar el script(Cargue el html)
    inicializarEventos() {
      if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.ready());

      } else {
        this.ready();
      }
    }

    ready() {
      this.mostrarProductosIniciales()
        // Selecciona el icono del tacho de basura
      let botonesEliminarItem = document.getElementsByClassName('btn-eliminar');
      for (let button of botonesEliminarItem) {
        button.addEventListener('click', (e) => this.eliminarItemCarrito(e));
      }
  
      let botonesSumarCantidad = document.getElementsByClassName('sumar-cantidad');
      for (let button of botonesSumarCantidad) {
        button.addEventListener('click', (e) => this.sumarCantidad(e));
      }
  
      let botonesRestarCantidad = document.getElementsByClassName('restar-cantidad');
      for (let button of botonesRestarCantidad) {
        button.addEventListener('click', (e) => this.restarCantidad(e));
      }
  
      let botonesAgregarAlCarrito = document.getElementsByClassName('boton-item');
      for (let button of botonesAgregarAlCarrito) {
        button.addEventListener('click', (e) => this.agregarAlCarritoClicked(e));
      }
      document.getElementsByClassName('btn-pagar')[0].addEventListener('click', () => this.pagarClicked());
      document.getElementsByClassName('btn-vaciar-carrito')[0].addEventListener('click', () => this.vaciarCarrito());
    }
    
  

    cargarLocalStorage(){
      const carritoInicial = localStorage.getItem('carrito')
      return carritoInicial ? JSON.parse(carritoInicial) : []
    }
    
    actualizarCarritoLocalStorage(){
      localStorage.setItem('carrito', JSON.stringify(this.items))
    }

    mostrarProductosIniciales(){
      // console.log('db simulada:',db)
      db.forEach((producto)=> {
        // Crear el contenedor del producto
        const contenedorProducto = document.createElement('div')
        contenedorProducto.classList.add('item')

        // Crear el titulo del producto
        const tituloProducto = document.createElement('span')
        tituloProducto.classList.add('titulo-item')
        tituloProducto.textContent = producto.titulo

        // Crear el elemento y el  precio del producto
        const precioProducto = document.createElement('span')
        precioProducto.classList.add('precio-item')
        precioProducto.textContent = producto.precio

        // Crea la imagen y agrega la clase y el src
        const imgProducto = document.createElement('img')
        imgProducto.classList.add('img-item')
        imgProducto.setAttribute('src',producto.imagenSrc)

        // Crea el btn,agrega la clase ,agrega el texto y la funcionalidad(addEventListener)
        const butonAgregarCarrito = document.createElement('button')
        butonAgregarCarrito.classList.add('boton-item')
        butonAgregarCarrito.textContent = 'Agregar al Carrito'
        butonAgregarCarrito.addEventListener('click',(e) => {
          this.agregarAlCarritoClicked(e)
        } )

        contenedorProducto.appendChild(tituloProducto)
        contenedorProducto.appendChild(imgProducto)
        contenedorProducto.appendChild(precioProducto)
        contenedorProducto.appendChild(butonAgregarCarrito)
        // Se agrega y sale de esta forma: 

        // <div class="item">
        //         <span class="titulo-item">NIKE JORDAN BROWN</span>
        //         <img src="img/zapatillas2.jpg" alt="" class="img-item">
        //         <span class="precio-item">$250.000</span>
        //         <button class="boton-item">Agregar al Carrito</button>
        //     </div>

        const contenedorProductos = document.querySelector('.contenedor-items')
        contenedorProductos.appendChild(contenedorProducto)
      })

    }

    pagarClicked() {
      Swal.fire({
        title: "Felicitaciones",
        text: "Gracias por su compra!",
        icon: "success"
      });
  
      this.items = [];
      this.renderItems();
      this.actualizarTotalCarrito();
      this.ocultarCarrito();
    }
  
    agregarAlCarritoClicked(event) {
    // Construye el objeto a agregar al arreglo del carrito y lo agrega.
    //Luego actualiza el carrito y por ultimo lo muestra.
      let button = event.target;
      let itemElement = button.parentElement;
      let titulo = itemElement.getElementsByClassName('titulo-item')[0].innerText;
      let precio = itemElement.getElementsByClassName('precio-item')[0].innerText;
      let imagenSrc = itemElement.getElementsByClassName('img-item')[0].src;
      let item = new ItemCarrito(titulo, precio, imagenSrc);
  
      if (this.items.some(existingItem => existingItem.titulo === titulo)) return 
      this.items.push(item);
      this.actualizarCarritoLocalStorage()
      this.renderItems();
      this.hacerVisibleCarrito();
    }
  
  hacerVisibleCarrito() {
    // si hay elementos en el localS abre auto el carrito, sino se oculta
    const existeProductosEnLocalStorage = localStorage.getItem('carrito')
    if (existeProductosEnLocalStorage ) {
      // Achica el contenedor de las tarjetas para que aparezca el carrito.
      this.carritoVisible = true;
      let carrito = document.getElementsByClassName('carrito')[0];
      carrito.style.marginRight = '0';
      carrito.style.opacity = '1';
      let itemsContainer = document.getElementsByClassName('contenedor-items')[0];
      itemsContainer.style.width = '60%';
    }
  }
  
    renderItems() {
    // Muestra los productos del carrito en cajitas,luego de recorrer el arreglo.
      let itemsCarrito = document.getElementsByClassName('carrito-items')[0];
      itemsCarrito.innerHTML = '';
      const productosGuardadosEnLocalStorage = localStorage.getItem('carrito')
      console.log(JSON.parse(productosGuardadosEnLocalStorage),'productosGuardadosEnLocalStorage')
      this.items.forEach(item => {
        itemsCarrito.append(item.render());
      });
      this.actualizarTotalCarrito();
    }
  
    sumarCantidad(event) {
      let buttonClicked = event.target;
      let selector = buttonClicked.parentElement;
      let titulo = selector.parentElement.getElementsByClassName('carrito-item-titulo')[0].innerText;
  
      this.items.forEach(item => {
        if (item.titulo === titulo) {
          item.cantidad++;
        }
      });
      this.renderItems();
    }
  
    restarCantidad(event) {
      let buttonClicked = event.target;
      let selector = buttonClicked.parentElement;
      let titulo = selector.parentElement.getElementsByClassName('carrito-item-titulo')[0].innerText;
  
      this.items.forEach(item => {
        if (item.titulo === titulo && item.cantidad > 1) {
          item.cantidad--;
        }
      });
      this.renderItems();
    }
  
    eliminarItemCarrito(event) {
    // Recibe el evento, el buttonClicked es el tacho de basura.
      let buttonClicked = event.target;
      let titulo = buttonClicked.parentElement.getElementsByClassName('carrito-item-titulo')[0].innerText;
  
      this.items = this.items.filter(item => item.titulo !== titulo);
      this.renderItems();
      this.ocultarCarrito();
      this.actualizarCarritoLocalStorage()
    }
    vaciarCarrito(){
      localStorage.removeItem('carrito'); // Eliminar el carrito guardado en localStorage
      this.items = []; // Vaciar el carrito en memoria
      this.renderItems(); // Actualiza la UI
      this.actualizarTotalCarrito(); // Actualiza el total a 0
      this.ocultarCarrito(true); // Ocultar el carrito
    }
    ocultarCarrito(vaciarCarro = false) {
    // Cuando el arreglo de productos esta vacio, se oculta el carrito.
      if (this.items.length === 0 || vaciarCarro) {
        let carrito = document.getElementsByClassName('carrito')[0];
        carrito.style.marginRight = '-100%';
        carrito.style.opacity = '0';
        this.carritoVisible = false;
        let itemsContainer = document.getElementsByClassName('contenedor-items')[0];
        itemsContainer.style.width = '100%';
      }
    }
  
    actualizarTotalCarrito() {
    // Actualiza el valor del carrito
      let total = this.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    // Con el total de $ a pagar se redondea ese valor.   
      total = Math.round(total * 100) / 100;
      document.getElementsByClassName('carrito-precio-total')[0].innerText = '$' + total.toLocaleString("es") + ",00";
    }
  }
  
  class ItemCarrito {
    constructor(titulo, precio, imagenSrc) {
      this.titulo = titulo;
      this.precio = parseFloat(precio.replace('$', '').replace('.', ''));
      this.imagenSrc = imagenSrc;
      this.cantidad = 1;
    }
//   Crea cada uno de las tarjetas del carrito
    render() {
      let item = document.createElement('div');
      item.classList.add('carrito-item');
      item.innerHTML = `
        <img src="${this.imagenSrc}" width="80px" alt="">
        <div class="carrito-item-detalles">
          <span class="carrito-item-titulo">${this.titulo}</span>
          <div class="selector-cantidad">
            <i class="fa-solid fa-minus restar-cantidad"></i>
            <input type="text" value="${this.cantidad}" class="carrito-item-cantidad" disabled>
            <i class="fa-solid fa-plus sumar-cantidad"></i>
          </div>
          <span class="carrito-item-precio">$${this.precio.toLocaleString("es")},00</span>
        </div>
        <button class="btn-eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
  
      item.getElementsByClassName('btn-eliminar')[0].addEventListener('click', (e) => carrito.eliminarItemCarrito(e));
      item.getElementsByClassName('restar-cantidad')[0].addEventListener('click', (e) => carrito.restarCantidad(e));
      item.getElementsByClassName('sumar-cantidad')[0].addEventListener('click', (e) => carrito.sumarCantidad(e));
  
      return item;
    }
  }
  
  const carrito = new Carrito();
  