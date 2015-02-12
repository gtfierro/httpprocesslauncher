var queryURL = "http://10.4.10.127:8000"

var ProcessList = React.createClass({displayName: "ProcessList",
    render: function() {
        var processes = this.props.processes.map(function(proc) {
            return (
                React.createElement(Process, {name: proc, key: proc})
            )
        });
        return (
            React.createElement("div", {className: "processList"}, 
            processes
            )
        );
    }
});

var Process = React.createClass({displayName: "Process",
    getInitialState: function() {
        return({on: false});
    },
    handleClick: function(e) {
        var isOnReq = e.target.getAttribute('data-buttontype') == 'on';
        var postURL = isOnReq ? queryURL+'/run' : queryURL+'/kill'
		console.log("post %v", postURL)
        var postData = this.props.name;
        $.ajax({
            url: postURL,
            dataType: 'json',
            type: 'POST',
            data: postData,
            success: function(data) {
                this.setState({on: isOnReq});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(postURL, status, err.toString());
            }.bind(this)
        });
    },
	getStatus: function() {
		$.ajax({
			url: queryURL+'/status/'+this.props.name,
			dataType: 'json',
			type:'GET',
			success: function(data) {
				this.setState({on: data.alive});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(queryURL, status, err.toString());
			}.bind(this)
		});
	},
	componentDidMount: function() {
		setInterval(this.getStatus, 1000);
	},
    render: function() {
        var Button = ReactBootstrap.Button;
        var ButtonToolbar = ReactBootstrap.ButtonToolbar;
        var onActive = this.state.on;
        return (
            React.createElement("div", {className: "process"}, 
                React.createElement("h2", null, this.props.name), 
                React.createElement("p", null, React.createElement("b", null, "Running?  "), this.state.on ? 'YES' : 'no'), 
                React.createElement(ButtonToolbar, null, 
                    React.createElement(Button, {bsStyle: "success", 
                            active: onActive, 
                            "data-buttontype": "on", 
                            onClick: this.handleClick}, 
                    this.state.loading ? 'Loading...' : 'On'
                    ), 

                    React.createElement(Button, {bsStyle: "danger", 
                            active: !onActive, 
                            "data-buttontype": "off", 
                            onClick: this.handleClick}, 
                    this.state.loading ? 'Loading...' : 'Off'
                    )
                )

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
