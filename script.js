const compare = (a, b) => {
    a = String(a);
    b = String(b);

    let bigger = 1;
    let smaller = -1;

    // a is negative and b is not
    if (a[0] === '-' && b[0] !== '-') {
        return smaller;
    }

    // b is negative and a is not
    if (b[0] === '-' && a[0] !== '-') {
        return bigger;
    }

    // both are negative
    if (a[0] === '-' && b[0] === '-') {
        // we switch what bigger and smaller mean
        bigger = -1;
        smaller = 1;
        // we remove the negative signs
        a = a.substring(1);
        b = b.substring(1);
    }

    [a, b] = alignDecimals(a, b);

    // a has more digits
    if (a.length > b.length) {
        return bigger;
    }

    // b has more digits
    if (a.length < b.length) {
        return smaller;
    }

    let pos = 0;

    while (pos < a.length && a[pos] === b[pos]) {
        pos++;
    }

    // we reached the end of the numbers and did not find any different numbers
    if (pos === a.length) {
        return 0;
    }

    return Number(a[pos]) > Number(b[pos]) ? bigger : smaller;
}

const add = (a, b) => {
    a = String(a);
    b = String(b);

    log('Expected result: ', Number(a) + Number(b));

    let negative = false;

    // a is negative and b is not
    if (a[0] === '-' && b[0] !== '-') {
        return subtract(b, a);
    }

    // b is negative and a is not
    if (b[0] === '-' && a[0] !== '-') {
        return subtract(a, b);
    }

    // both are negative
    if (a[0] === '-' && b[0] === '-') {
        negative = true;
        a = a.substring(1);
        b = b.substring(1);
    }

    [a, b, decimals] = alignDecimals(a, b);

    log('A', a);
    log('B', b);
    log('Decimals: ', decimals);

    let a_pos = a.length;
    let b_pos = b.length;
    let remember = 0;
    let result = '';

    do {
        a_pos--;
        b_pos--;

        const sum = (Number(a[a_pos]) || 0) + (Number(b[b_pos]) || 0) + remember;

        result = String(sum % 10) + result;
        remember = Math.floor(sum / 10);

    } while (a_pos > 0 || b_pos > 0);

    if (remember) {
        result = String(remember) + result;
    }

    log('Result without decimals: ', result);

    if (decimals) {
        result = result.substring(0, result.length - decimals) + "." + result.substring(result.length - decimals);

        log('Result with decimals: ', result);
    }

    return (negative ? '-' : '') + result;
}

const subtract = (a, b) => {
    log('Subtracting', b, 'from', a);
    log('Expected', a - b);

    a = String(a);
    b = String(b);

    // a is negative and b is not
    if (a[0] === '-' && b[0] !== '-') {
        return add(a, '-' + b);
    }

    // b is negative and a is not
    if (b[0] === '-' && a[0] !== '-') {
        return add(a, b.substring(1));
    }

    // both negative numbers
    if (a[0] === '-' && b[0] === '-') {
        return add(a, b);
    }

    [a, b, decimals] = alignDecimals(a, b);

    let negative = false;

    if (-1 === compare(a, b)) {
        let c = a;
        a = b;
        b = c;
        negative = true;
    }

    let a_pos = a.length;
    let b_pos = b.length;
    let remember = 0;
    let result = '';

    do {
        a_pos--;
        b_pos--;

        let number_a = Number(a[a_pos] || 0);
        let number_b = Number(b[b_pos] || 0) + remember;

        remember = 0;

        if (number_a < number_b) {
            number_a += 10;
            remember = 1;
        }

        const res = number_a - number_b;
        result = String(res) + result;

    } while (a_pos > 0 || b_pos > 0);

    return normalizeResult(result, decimals, negative);
}

const multiply = (a, b) => {
    log('Multiplying', a, 'by', b);
    log('Expected', a * b);

    a = String(a);
    b = String(b);

    let negative = false;

    // a is negative and b is not
    if (a[0] === '-' && b[0] !== '-') {
        a = a.substring(1);
        negative = true;
    } else if (b[0] === '-' && a[0] !== '-') {
        b = b.substring(1);
        negative = true;
    } else if (b[0] === '-' && a[0] === '-') {
        a = a.substring(1);
        b = b.substring(1);
    }

    const decimals = countDecimals(a) + countDecimals(b);

    a = a.replace('.', '');
    b = b.replace('.', '');

    // shorter number should be second
    if (a.length < b.length) {
        let c = a;
        a = b;
        b = c;
    }

    log('Multiplying', a, 'and', b)

    let b_pos = b.length;
    let result = 0;

    do {
        b_pos--;
        let a_pos = a.length;
        let remember = 0;

        let number = '';
        for (let i = 0; i < (b.length - 1) - b_pos; i++) {
            number += '0';
        }

        do {
            a_pos--;

            const multiple = Number(b[b_pos]) * Number(a[a_pos]) + remember;

            number = String(multiple % 10) + number;
            remember = Math.floor(multiple / 10);

        } while (a_pos > 0);

        if (remember) {
            number = String(remember) + number;
        }
        log(number);

        result = add(result, number);

    } while (b_pos > 0);

    return normalizeResult(result, decimals, negative);
}

const divide = (a, b, decimalDigits = 10) => {
    log('Dividing', a, 'by', b);
    log('Expected', a / b);

    a = String(a);
    b = String(b);

    const decimals = countDecimals(a) - countDecimals(b);

    a = a.replace('.', '');
    b = b.replace('.', '');

    let result = '';

    let decimalPoint = 0; // 0 from the end of the resulting string

    // make sure that a is bigger than b
    while (
        (a.length < b.length)
        || (a.length == b.length && Number(a[0]) < Number(b[0]))
     ) {
        result += '0';
        a += 0;
        decimalPoint += 1;
    }



    log('a:', a);
    log('result:', result);
    log('dec. point:', decimalPoint);
}

const countDecimals = a => {
    const a_decimal = a.indexOf('.');

    return a_decimal === -1 ? 0 : a.length - (a_decimal + 1);
}

const alignDecimals = (a, b) => {
    const a_decimals = countDecimals(a);
    const b_decimals = countDecimals(b);

    const decimals = Math.max(a_decimals, b_decimals);

    if (a_decimals > b_decimals) {
        b = b.padEnd(b.length + (a_decimals - b_decimals), '0');
    } else if (a_decimals < b_decimals) {
        a = a.padEnd(a.length + (b_decimals - a_decimals), '0');
    }

    a = a.replace('.', '');
    b = b.replace('.', '');

    return [
        a,
        b,
        decimals
    ];
}

const normalizeResult = (result, decimals = 0, negative = false) => {
    log('Decimals: ', decimals);
    if (decimals > 0) {
        result = result.substring(0, result.length - decimals) + "." + result.substring(result.length - decimals);
        result = result.replace(/0+$/, '');
    } else if (decimals < 0) {
        result = result.padEnd(result.length + decimals, '0');
    }

    return (negative ? '-' : '') + (result.substring(0, 2) === '0.' ? result : result.replace(/^0+/, ''));
}

const log = (...args) => {
    document.querySelector('.log').innerHTML += args.join(' ') + "\n";
}

const clearLog = () => {
    document.querySelector('.log').innerHTML = '';
}

const calculate = operation => {
    clearLog();

    const a = document.querySelector('input[name="a"]').value.trim();
    const b = document.querySelector('input[name="b"]').value.trim();

    const result = operation(a, b);

    document.querySelector('.result').innerHTML = result;
}

document.querySelector('.compare').addEventListener('click', ev => {
    ev.preventDefault();

    calculate(compare)
})

document.querySelector('.times').addEventListener('click', ev => {
    ev.preventDefault();

    calculate(multiply)
})

document.querySelector('.divide').addEventListener('click', ev => {
    ev.preventDefault();

    calculate(divide)
})

document.querySelector('.add').addEventListener('click', ev => {
    ev.preventDefault();

    calculate(add)
})

document.querySelector('.subtract').addEventListener('click', ev => {
    ev.preventDefault();

    calculate(subtract)
})