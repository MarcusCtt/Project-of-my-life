var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');

const UploadProduct = require('./public/js/UploadProductPhoto')

require('dotenv').config()
const paypal = require('paypal-rest-sdk');


paypal.configure({
  'mode': process.env.ENVIRONMENT, //sandbox or live
  'client_id':process.env.CLIENT_ID,
  'client_secret':process.env.APP_SECRET
});   


mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "tcc_project"
})


var app = express();


app.use(express.static('public'));
app.use(express.static('views'));
app.set('view engine', 'ejs');


app.listen(8888, () => {
    console.log("listening on http://localhost:8888/");
  });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "secret",    
                  resave: true,
                  saveUninitialized: true }));




app.get('/', function (req, res) {


    var con = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "tcc_project"
    })

    con.query("Select * from produto", (err, result) => {
        res.render('pages/index', { result: result });
    })


});

function calculoTotal(cart, req) {

    
    total = 0;
    for (let i = 0; i < cart.length; i++) {

        if (cart[i].desconto) {
            total = total + (cart[i].desconto * cart[i].quantity);
        } else {
            total = total + (cart[i].preco * cart[i].quantity);

        }
    }
    req.session.total = total;
    return total;


}




function isProductInCart(cart, id_produto) {


    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id_produto == id_produto) {
            return true;
        }
    }
    return false;


} 


app.post('/add_to_card', function (req, res) {

    var id_produto = req.body.id_produto;
    var Nome = req.body.Nome;
    var preco = req.body.preco;
    var desconto = req.body.desconto;
    var quantity = req.body.quantity;
    var image = req.body.image;
    var quantidade = req.body.quantidade;

    var produto = { id_produto: id_produto, Nome: Nome, preco: preco, desconto: desconto, quantity: quantity, image: image, quantidade:quantidade };

    if( id_produto == null){
        res.redirect('/cart');
    }else{
    if (req.session.cart) {
        var cart = req.session.cart;
        if (!isProductInCart(cart, id_produto)) {
            cart.push(produto);
        }
    
    } else {

        req.session.cart = [produto];
        var cart = req.session.cart;
    }

    // conta total
    calculoTotal(cart, req);

    // retorno pra pg de cart
    res.redirect('/cart');
    }
});



app.post('/product', function (req, res) {
    var id_produto = req.body.id_produto;
    var Nome = req.body.Nome;
    var preco = req.body.preco;
    var desconto = req.body.desconto;
    var quantity = req.body.quantity;
    var image = req.body.image;
    var quantidade = req.body.quantidade;
    var descricao = req.body.descricao;

    var produto = { id_produto: id_produto, Nome: Nome, preco: preco, desconto: desconto, quantity: quantity, image: image, quantidade:quantidade, descricao:descricao };

    
    res.render('pages/pageProduto', {produto:produto});


});

app.get('/cart', function (req, res) {

    var cart = req.session.cart;
    var total = req.session.total;
    res.render('pages/cart', { cart: cart, total: total });


});

app.get('/about', function (req,res){
    res.render('pages/about');

});


app.post('/remove_produto', function (req, res) {

    var id_produto = req.body.id_produto;
    var cart = req.session.cart;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id_produto == id_produto) {
            cart.splice(cart.indexOf(i), 1);
        }
    }

    // calculo dnovo
    calculoTotal(cart, req);
    // retorno pra pg de cart
    res.redirect('/cart');
});

app.post('/edit_product_quantity', function (req, res) {
    var id_produto = req.body.id_produto;
    var quantidade = req.body.quantidade;
    var quantity = req.body.quantity;
    var increase_btn = req.body.increase_product_quantity;
    var decrease_btn = req.body.decrease_product_quantity;

    var cart = req.session.cart;

    if (increase_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id_produto == id_produto) {
                if (cart[i].quantity > 0 && cart[i].quantidade > cart[i].quantity ) {
                    cart[i].quantity = parseInt(cart[i].quantity) + 1;

                }
            }
        }

    }


    if (decrease_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id_produto == id_produto) {
                if (cart[i].quantity > 1) {
                    cart[i].quantity = parseInt(cart[i].quantity) - 1;

                }
            }
        }

    }

    // calculo dnovo
    calculoTotal(cart, req);
    // retorno pra pg de cart
    res.redirect('/cart');

})



app.get('/checkout', function (req, res) {
    var total = req.session.total;
    res.render('pages/cadastro', { total: total })
});

app.post('/place_order', function (req, res) {

    var nome = req.body.nome;
    var cidade = req.body.cidade;
    var email = req.body.email;
    var phone = req.body.phone;
    var endereco = req.body.endereco;
    var cpf = req.body.cpf;  
    var custo = req.session.total;
    var status = "Não Pago";
    var data = new Date();
    var produto_ids = "";


    var con = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "tcc_project"
    })

    var cart = req.session.cart;
    for (let i = 0; i < cart.length; i++) {
        produto_ids = produto_ids + "," + cart[i].id_produto;
    }

    con.connect((err) => {
        if (err) {

            console.log(err);

        } else {
            var query = "Insert into pedidos(produtos_ids, custo, status, data, nome, email, cidade, endereco, telefone, cpf) values ?";

            var values = [
                [produto_ids, custo, status, data, nome, email, cidade, endereco, phone, cpf]
            ];
            con.query(query, [values], (err, result) => {
                res.redirect('/payment');
            })
        }
    })

});







app.get('/categorias', function (req, res){
    var tipo = req.query.TipoSolicitada;

    var con = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "tcc_project"
    })

    con.query('Select * from produto where tipo_id = ?',[tipo],  (err, result) => {
        res.render('pages/categoria', { result: result, tipo:tipo });
    })

    

  
});


app.get('/4dm1n', function (req, res){
     res.render('pages/admin');
});

app.post('UploadProduct', UploadProduct.single('ProductImage'), (req, res) =>{
  
    var con = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "tcc_project"
    })

    con.connect((err) => {
        if (err) {
            console.log('Erro com o banco');

        } else {
            var query = "Insert * from Product(Nome, descricao, preco, desconto, quantidade, image, Cat, tipo_id) values ?";

            var values = [
                [Nome, descricao, preco, desconto, quantidade, image, Cat, tipo_id]
            ];
            con.query(query, [values], (err) => {
                
               
            })
        }
    })
    

 
 
    if(req.file){

return res.json({
    error:false,
    message: "Realizado com sucesso"
})

 } return res.status(400).json({
    error:true,
    message: "Não realizado"
})



});






app.get('/payment', function (req, res) {
    var total = req.session.total;
    res.render('pages/pagamento', { total: total })
});

app.post('/pay', (req, res) => {

    var TOTAL = req.session.total;
    var total  = TOTAL.toFixed(2);

    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:8888/",
          "cancel_url": "http://localhost:8888/"
      },
      "transactions": [{

          "amount": {
              "currency": "BRL",
              "total": total
          },
          
      }]
  };
  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "BRL",
              "total": total
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send(('Realizada com sucesso'));
      }
  });
  });
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
              if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href);
              }
            }
        }
      });
      
      });
  app.get('/cancel', (req, res) => res.send('Cancelado com sucesso.'));

  