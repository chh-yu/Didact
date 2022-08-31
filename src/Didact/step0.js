module.exports = index = ()=>{
    const container = document .getElementById('root')
    /**
     * 1. jsx
     */
    // const element = <h1 title='foo'>hello</h1>

    /**
     * 2. createElement
     */
    // const element = React.createElement(
    //     'h1',
    //     {title: 'foo'},
    //     'hello'
    // )

    /**
     * 3. element
     */
    const element = {
        type: 'h1',
        props: {
            title: 'foo',
            children: 'hello'
        }
    }

    /**
     * ReactDOM.render
     */
    // ReactDOM.render(element, container)

    const node = document.createElement(element.type)
    node['title'] = element.props.title

    const text = document.createTextNode('')
    text['nodeValue'] = element.props.children

    node.appendChild(text)
    container.appendChild(node)
}