export function isNumber(value: any): boolean {
    console.log(value)
    return typeof value === 'number' && !isNaN(value);
}