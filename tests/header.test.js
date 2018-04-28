const Page = require('./helpers/page');

let page;

beforeEach( async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
})

afterEach( async () => {
   await page.close();
})

test('Header has the correct text', async () => {     
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster')
});

test('Click on the link', async () => {
    await page.waitFor('.right a');
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})

test('when sign in, shows logout button', async () => {   
    await page.login();     
    await page.waitFor('a[href="/auth/logout"]');
    const result = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    expect(result).toEqual('Logout');
})