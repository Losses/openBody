'use strict';

const React = require('react');
const browserHistory = require('react-router').browserHistory;


let setUnitWidth = function(colStyle){
    if (colStyle.fixedWidth)
        return {width: colStyle.fixedWidth}
    
    let styleSet = {};
    
    styleSet.flex = colStyle.flex ? colStyle.flex : 1;
    styleSet.minWidth = colStyle.minWidth ? colStyle.minWidth : 'auto';
    
    return styleSet;
}

let getKey = function(row, scope, colName){
    return row[scope.props.keyName] + '-' + colName;
}

let DataTable = React.createClass({
    
    handleClick: function(event){
        let location, para, id, type;
        
        para = this.props.location,
        id = event.target.parentNode.getAttribute('data-id');
        type = id[0]==='r' ? 'run' : 'exercise';
        
        location = para.replace(':id',id.replace(/[^0-9]/g,"")).replace(':type', type);
        
        browserHistory.push(location);
    },
    
    getInitialState: function(){
        return {
            data: []
        }
    },
    
    componentDidMount: function(){
        let that = this;
        if (this.props.dataSourceFun)
            this.props.dataSourceFun(data => this.setState({data: data}));
    },
    
    render: function(){
        let cols = this.props.columns;
        let that = this;
        
        return (
            <table className='data_view'>
                <thead><tr>{
                    cols.map(function(col){
                        return (
                        <td  key={col.name}
                             style={setUnitWidth(col)}>
                            {col.title || col.name}
                        </td>
                        )
                    })
                }</tr></thead>
                
                <tbody>
                <tr></tr>
                {
                    this.state.data.map(function(row){
                        return (
                        <tr key={row[that.props.keyName]}
                            data-id={row.id}
                            onClick={that.handleClick}>{
                        cols.map(function(col){
                            return (
                                <td key={getKey(row, that, col.name)}
                                    style={setUnitWidth(col)}>
                                    {row[col.name]}
                                </td>
                            )
                        })
                        }
                        </tr>
                        )
                    })
                }
                </tbody>
            </table>
        )
    }
});

module.exports = DataTable;