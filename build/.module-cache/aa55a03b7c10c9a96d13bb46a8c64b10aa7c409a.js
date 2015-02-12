var queryURL = "http://localhost:8000"

var Process = React.createClass({displayName: "Process",
    render: function() {
        return (
            React.createElement("div", {className: "process"}, 
                React.createElement("p", null, this.props.process)
            )
        );
    }
});

var Dashboard = React.createClass({displayName: "Dashboard",
    getInitialState: function() {
        return {processes: []};
    },
    componentDidMount: function() {
        // retrieve all HVAC zones
        $.ajax({
            url: queryURL+'/list',
            dataType: 'json',
            type: 'GET',
            success: function(data) {
                this.setState({processes: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(queryURL, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        return (
            React.createElement("div", {className: "dashboard"}, 
                React.createElement("h1", null, "Controller Process Manager"), 
                React.createElement(ProcessList, {processes: this.state.processes})
            )
        );
    }
});

React.render(
    React.createElement(Dashboard, null),
    document.getElementById('content')
);
