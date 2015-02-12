var queryURL = "http://localhost:8000"

var ProcessList = React.createClass({
    render: function() {
        var processes = this.props.processes.map(function(proc) {
            return (
                <Process name={proc} key={proc} />
            )
        });
        return (
            <div className="processList">
            {processes}
            </div>
        );
    }
});

var Process = React.createClass({
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
            <div className="process">
                <h2>{this.props.name}</h2>
                <p><b>Running?  </b>{this.state.on ? 'YES' : 'no'}</p>
                <ButtonToolbar>
                    <Button bsStyle="success" 
                            active={onActive} 
                            data-buttontype="on"
                            onClick={this.handleClick}>
                    {this.state.loading ? 'Loading...' : 'On'}
                    </Button>

                    <Button bsStyle="danger" 
                            active={!onActive} 
                            data-buttontype="off"
                            onClick={this.handleClick}>
                    {this.state.loading ? 'Loading...' : 'Off'}
                    </Button>
                </ButtonToolbar>

            </div>
        );
    }
});

var Dashboard = React.createClass({
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
            <div className="dashboard">
                <h1>Controller Process Manager</h1>
                <ProcessList processes={this.state.processes} />
            </div>
        );
    }
});

React.render(
    <Dashboard />,
    document.getElementById('content')
);
