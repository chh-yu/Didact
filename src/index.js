import {Didact} from './Didact/step4_fibers'
console.log('running')
const root = document.getElementById('root')

/**
 * function App(props) {
 *  return <h1>Hi {props.name}</h1>
 * }
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
	Didact.createElement('b')
)

Didact.render(element, root)
