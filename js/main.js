var app = new Vue({
    el: ".products",
    data: {
        products: [{ id: 1, title: "TAG 500 (TAG 435)", short_text: 'Root vegetable Deep red Vibrant.', image: '../images/iskra.jpg', desc: "Spark beets are a low-calorie root vegetable that is widely used in cooking due to its sweet taste and rich red color. Spark beets are rich in vitamins and minerals such as vitamin C, folic acid, potassium and magnesium. It also contains antioxidants, which help protect the body from the harmful effects of free radicals. Spark is low in calories, making it a popular choice for those watching their weight or health." },
        { id: 2, title: "TAG 501 (TAG 416)", short_text: 'Root vegetable Dark red Medium-sized', image: '../images/kazimir.jpg', desc: "Casimir beet is a beet variety that is usually characterized by the following features. Beets of the Kazimir variety are usually characterized by high yields. Suitable growing and care conditions can provide a significant harvest of root vegetables. Root vegetables have a round shape with a smooth surface. Sizes may vary depending on growing conditions, but usually reach medium to large sizes." },
        { id: 3, title: "TAG 502 (TAG 429)", short_text: 'Root vegetable Purple Large-sized', image: '../images/klarin.jpg', desc: "Beetroot Clarina is a beet variety that has a round shape and the root crops are quite large. This beet variety has excellent taste and high nutritional qualities. Beet pulp is juicy, tender and sweet. Clarin beets can be resistant to certain diseases and pests, making them easy to grow. Successful growing of beets requires adequate sunlight, well-drained soil and moderate watering." },
        { id: 4, title: "TAG 503 (TAG 485)", short_text: 'Root vegetable Pink Elongated.', image: '../images/kozak.jpg', desc: "Beet Kozak is a beet variety characterized by good yield. Suitable growing conditions make it possible to obtain a significant amount of root crops per hectare. This beet variety usually has good resistance to major diseases and pests, which simplifies the growing process and reduces the risk of crop loss. Beets can be adapted to a variety of climates, making them a popular choice for growing in different regions." },
        { id: 5, title: "TAG 504 (TAG 433)", short_text: 'Root vegetable Deep red Vibrant', image: '../images/latifa.jpg', desc: "The beet variety Latifa is a mid-season variety characterized by high yield and excellent taste. Root vegetables of the Latifa variety have a round shape and are characterized by juicy pulp with a pronounced sweet taste. Beets are known for their relative resistance to various diseases and stress conditions, making them a reliable choice for growing in a variety of climates. This variety typically produces high yields." }],
        btnVisible: 0,
        product: {},
        cart: [],
        contactFields: [],
        orderSubmitted: false
    },
    mounted: function () {
        console.log(window.localStorage.getItem('prod'));
        this.getProduct();
        this.checkInCart();
        this.getCart();
    },
    methods: {
        checkInCart: function () {
            if (this.product && this.product.id && window.localStorage.getItem('cart').split(',').indexOf(String(this.product.id)) != -1) this.btnVisible = 1;
        },
        addItem: function (id) {
            window.localStorage.setItem('prod', id);
        },
        getProduct: function () {
            if (window.location.hash) {
                var id = window.location.hash.replace('#', '');
                if (this.products && this.products.length > 0) {
                    for (i in this.products) {
                        if (this.products[i] && this.products[i].id && id == this.products[i].id) this.product = this.products[i];
                    }
                }
            }
        },
        addToCart: function (id) {
            var cart = [];
            if (window.localStorage.getItem('cart')) {
                cart = window.localStorage.getItem('cart').split(',');
            }
            if (cart.indexOf(String(id)) == -1) {
                cart.push(id);
                window.localStorage.setItem('cart', cart.join());
                this.btnVisible = 1;
            }
        },
        getCart: function () {
            var cartIds = window.localStorage.getItem('cart').split(',');
            this.cart = this.products.filter(product => cartIds.includes(String(product.id)));
        },
        removeFromCart: function (id) {
            var cart = window.localStorage.getItem('cart').split(',');
            var index = cart.indexOf(String(id));
            if (index !== -1) {
                cart.splice(index, 1);
                window.localStorage.setItem('cart', cart.join());
                this.cart = [];
                this.getCart();
            }
        },
        makeOrder() {
            this.cart = [];
            localStorage.removeItem('cart');
            this.orderSubmitted = true;
        }
    }
});