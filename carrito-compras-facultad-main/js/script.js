import {keys} from "../assets/keys";
console.log("keys",keys)


const $d = document;
const $sneakers = $d.getElementById("");
const $template = $d.getElementById("sneakers-template").content;
const $fragment = $d.createDocumentFragment();
const options = { headers: {Authorization: `Bearer ${keys.secret}`}}
const FormatoDeMoneda = num => `$${num.slice(0, -2)}.${num.slice(-2)}`;

let products, prices;

Promise.all([
    fetch("https://api.stripe.com/v1/products", options),
    fetch("https://api.stripe.com/v1/prices", options)
])
.then(responses => Promise.all(responses.map(res => res.json())))
.then(json => {
    console.log("respuestas:",json)
    products = json[0].data;
    prices = json[1].data;
    prices.forEach(el => {
        let productData = products.filter(product => product.id === el.product);
        
        $template.querySelector(".sneakers").setAttribute("data-price", el.id);
        $template.querySelector("img").src = productData[0].images[0];
        $template.querySelector("img").alt = productData[0].name;
        $template.querySelector("figcaption").innerHTML = `${productData[0].name} ${FormatoDeMoneda(el.unit_amount_decimal)} ${(el.currency).toUpperCase()}`;

        let $clone = $d.importNode($template, true);

        $fragment.appendChild($clone);
    });

    $sneakers.appendChild($fragment);
})
.catch(error => {
    let message = error.statuText || "Ocurrió un error en la petición";

    $sneakers.innerHTML = `Error: ${error.status}: ${message}`;
})

$d.addEventListener("click", e => {
    if (e.target.matches(".sneakers *")) {
        let priceId = e.target.parentElement.getAttribute("data-price");

        Stripe(keys.public).redirectToCheckout({
            lineItems: [{
                price: priceId,
                quantity: 1
            }],
            mode: "subscription",
            successUrl:"http://127.0.01:5500/assets/success.html",
            cancelUrl:"http://127.0.01:5500/assets/cancel.html"
        })
        .then(res => {
            if (res.error){
                $sneakers.insertAdjacentElement("afterend", res.error.message)
            }
        })
    }
})