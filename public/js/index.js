
var checkbox = document.querySelector("input[name=checkbox]");



checkbox.addEventListener('change', function() {
    var endereco = document.querySelector('#endereco');

    if (checkbox.checked) {
        endereco.value ='Retirada na loja';
    } else {
        endereco.value =' ';
    }
  }
);
  

function TestaCPF(strCPF) {
var Resto,  Soma = 0;
  if (strCPF == "00000000000")
  return false;

  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;

  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
}
