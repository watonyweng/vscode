import parse from '../src/pure/parsers'
import { expect } from 'chai'

describe('parse', () => {
  it('parse', () => {
    const out = parse(
      'x.js',
      ''
      + 'let a = 10;\n'
      + 'describe(`x ${a} sdf`, () => {\n'
      + '    for (let i = 0; i < 5; i++){it(\'run\' + i, () => {})}\n'
      + '}); \n'
      + 'test(\'add\', () => {})',
    )

    expect(out.describeBlocks.length).to.equal(1)
    expect(out.itBlocks.length).to.equal(1)
  })

  it('parse skipIf with concurrent #36', () => {
    const out = parse(
      'x.js',
      ''
      + 'describe.skipIf(true).concurrent(`test`, () => {\n'
      + '}); \n',
    )

    expect(out.describeBlocks.length).to.equal(1)
  })

  it('parse each', () => {
    const out = parse(
      'x.js',
      ''
        + 'describe.each([1,2,3])(`test %i`, (i) => {\n'
        + '}); \n',
    )
    expect(out.describeBlocks.length).to.equal(1)
    expect(out.describeBlocks[0].lastProperty).to.equal('each')
  })

  it('parse decorator', () => {
    const out = parse(
      'x.ts',
      ''
      + 'let a = 10;\n'
      + 'describe(`x ${a} sdf`, () => {\n'
      + '    class B { \n'
      + '         constructor(@Inject(A) public a: A) {} \n'
      + '    } '
      + '});',
    )

    expect(out.describeBlocks.length).to.equal(1)
  })

  it('parse using keyword', () => {
    const out = parse(
      'x.ts',
      `
      import { expect } from 'chai';

      (Symbol as any).dispose ??= Symbol('Symbol.dispose');
      (Symbol as any).asyncDispose ??= Symbol('Symbol.asyncDispose')

      describe('using keyword', () => {
        it('dispose', () => {
          function getDisposableResource() {
            using resource = new SomeDisposableResource()
            return resource
          }

          const resource = getDisposableResource()
          expect(resource.isDisposed).to.equal(true)
        })

        it('asyncDispose', async () => {
          async function getAsyncDisposableResource() {
            await using resource = new SomeAsyncDisposableResource()
            return resource
          }

          const resource = await getAsyncDisposableResource()
          expect(resource.isDisposed).to.equal(true)
        })
      })

      class SomeDisposableResource implements Disposable {
        public isDisposed = false;

        [Symbol.dispose](): void {
          this.isDisposed = true
        }
      }

      class SomeAsyncDisposableResource implements AsyncDisposable {
        public isDisposed = false

        async [Symbol.asyncDispose](): Promise<void> {
          await new Promise<void>(resolve => setTimeout(resolve, 0))
          this.isDisposed = true
        }
      }
      `,
    )

    expect(out.describeBlocks.length).to.equal(1)
  })

  it('parse satisfies keyword', () => {
    const out = parse(
      'x.ts',
      ''
      + 'type Person = {\n'
      + '    name: string\n'
      + '    age: number\n'
      + '};\n'
      + 'describe("satisfies keyword", () => {\n'
      + '  const person = {\n'
      + '      name: "test",\n'
      + '      age: 20\n'
      + '  } satisfies Person\n'
      + '});\n',
    )

    expect(out.describeBlocks.length).to.equal(1)
  })
})
