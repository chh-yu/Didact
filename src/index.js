import {Didact} from './Didact/step7_FC'
console.log('running')
const root = document.getElementById('root')

/**
 * function App(props) {
 *  return <h1>Hi {props.name}</h1>
 * }
 * 函数组件的不同点在于：
 * 函数组件的 fiber 没有 DOM 节点
 * 并且子节点由函数运行得来而不是直接从 props 属性中获取
 *
 */
function App(props) {
	return Didact.createElement('h1', null, 'Hi ', props.name)
}

const element = Didact.createElement(
	'div',
	{id: 'foo'},
	Didact.createElement(
		'a',
		{
			href: 'baidu.com',
		},
		'bar'
	),
	Didact.createElement('b'),
	Didact.createElement(App, {name: 'boo'})
)

Didact.render(element, root)
