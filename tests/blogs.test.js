const Page = require('./helpers/page');

let page;

beforeEach( async () => {
    page= await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach( async () =>{
    await page.close();
});

describe('When logged in', async () => {
    beforeEach( async () => {
       await page.login();
       await page.click('a.btn-floating');
    });
    test('Can see the Blog Title', async() => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And when using the valid inputs', async () => {
        beforeEach( async () => {
            await page.type('.title input[name="title"]', 'My Blog Title');
            await page.type('.content input[name="content"]', 'My Blog Content');
            await page.click('form button[type="submit"]');
        })
        test('submitting takes user to review screen',async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        })
        test('submitting then saving adds blog to index page',async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const blogTitle = await page.getContentsOf('.card .card-title');
            const blogContent = await page.getContentsOf('.card p');
            expect(blogTitle).toEqual('My Blog Title');
            expect(blogContent).toEqual('My Blog Content');
        })
    })

    describe('And using invalid input', async () => {
        beforeEach( async () => {
            await page.click('form button[type="submit"]');
        })
        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('When Not Logged in', async () => {
    const actions = [ {
            method: 'get',
            path: '/api/blogs'
        },{
            method: 'post',
            path: '/api/blogs',
            data: {title:'my title',content:'my content'}
        } ]

    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        for( let result of results ){
            expect(result).toEqual({error: 'You must log in!'});
        }
    })
})