var Inputmask = require('inputmask');

var selector = document.getElementById("cpf");

var im = new Inputmask("999-999-999.99");
im.mask(selector);


