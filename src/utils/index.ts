export function createPageUrl(pageName: string) {
    // .toLowerCase() makes "Estate Tax" become "estate-tax"
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}