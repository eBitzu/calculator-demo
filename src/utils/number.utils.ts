const numberFormatter = new Intl.NumberFormat('ro-RO');
const formatter = (val: number): string => {
    return numberFormatter.format(val);
}

const toNumber = (val: string): number => {
    const noDot = val.replace(/\./g, '');
    return Number.parseFloat(noDot.replace(',', '.')) || +val;
}

const switchSign = (val: string): string => {
    const number: number = +val;
    return `${number * -1}`;
};

export { numberFormatter, formatter, toNumber, switchSign };