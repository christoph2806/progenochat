import React, {Component} from 'react'
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import {withStyles} from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import Box from '@material-ui/core/Box';
import {ADD, REMOVE, REMOVEFIRST, UPDATE, SPEAKERS} from './constants.js';

const URL = process.env.REACT_APP_WEBSOCKET_URL;


const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  card: {
    textAlign: 'left',
    padding: 10,
    margin: 10,
    maxWidth: 370,
    color: theme.palette.text.secondary,
    borderRadius: 10,
    boxShadow: "0 2px 10px 1px #b5b5b5",
  },

  cardSpeaker: {
    textAlign: 'left',
    padding: 10,
    margin: 10,
    maxWidth: 370,
    color: theme.palette.text.secondary,
    borderRadius: 10,
    boxShadow: "0 2px 10px 1px #b5b5b5",
    backgroundColor: "#a0ed6d",
  },

  input: {
    margin: 20,
  },
  formItem: {
    margin: 10,
  },
  title: {
    fontSize: 14,
  },
});

class Chat extends Component {

  buttonStates = [
    {
      state: ADD,
      label: 'Hand heben',
      color: 'primary'
    },
    {
      state: REMOVE,
      label: 'Hand senken',
      color: 'secondary'
    },

  ];

  state = {
    name: '',
    oldName: '',
    inputState: true,
    messages: [],
    buttonState: this.buttonStates[0],
    speakers: [],
    isSpeaking: false,
  };

  ws = new WebSocket(URL);

  componentDidMount() {

    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected');
      this.getSpeakers();
    };

    this.ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      const speakers = JSON.parse(evt.data);
      this.setState({
        speakers: <ol>
          {speakers.map((item, index) => {
            const color = index === 0 ? 'secondary.main' : 'text.primary';
            return (
              <li key={index}>
                <Typography component={'span'}>
                  <Box component="span" color={color}>{item}</Box>
                </Typography>
              </li>
            )
          })}
        </ol>
      });
      if (speakers.indexOf(this.state.name) < 0) {
        this.setState({buttonState: this.buttonStates[REMOVE]});
      }
      this.setState({isSpeaking: speakers[0] === this.state.name});
    };

    this.ws.onclose = () => {
      console.log('disconnected');
      // automatically try to reconnect on connection loss
      this.setState({
        ws: new WebSocket(URL),
      })
    }
  }

  getSpeakers() {
    const message = {
      action: SPEAKERS
    };
    this.ws.send(JSON.stringify(message));
  }

  sendState() {
    const message = {
      action: this.state.buttonState.state,
      name: this.state.name
    };
    this.ws.send(JSON.stringify(message));
  }

  updateServer() {
    const message = {
      action: UPDATE,
      oldName: this.state.oldName,
      newName: this.state.name,
    };
    this.ws.send(JSON.stringify(message));

  }

  toggleButton = () => {
    this.setState({buttonState: this.buttonStates[this.state.buttonState.state]});
    this.sendState();
  };

  nameField() {
    const classes = this.props.classes;
    if (this.state.inputState) {
      return (
        <TextField
          className={classes.formItem}
          id="name"
          label="Bitte Namen eingeben"
          variant="filled"
          value={this.state.name}
          onChange={e => this.updateName(e)}
          onKeyDown={e => this.fixName(e)}
        />
      )
    } else {
      return (
        <div className={classes.formItem}>
          <span><Typography variant="h5" component="h2" color="textSecondary">
            {this.state.name}&nbsp;<EditIcon onClick={() => this.editName()}/>
          </Typography></span>
        </div>
      )
    }
  }

  fixName = e => {
    if (e.keyCode === 13) {
      this.setState({inputState: false});
      this.updateServer();
      this.setState({oldName: this.state.name});
    }
  };

  editName = () => {
    this.setState({inputState: true});
  };

  updateName = e => {
    e.preventDefault();
    this.setState({name: e.target.value});
  };

  moderateButton() {
    const classes = this.props.classes;
    if (this.state.name === 'Moderator') {
      return (
        <Button
          className={classes.formItem}
          variant="contained"
          color='secondary'
          onClick={e => this.nextSpeaker(e)}
        >Nächster Sprecher</Button>
      )
    } else if (this.state.name !== '') {
      return (
        <Button
          className={classes.formItem}
          variant="contained"
          color={this.state.buttonState.color}
          onClick={e => this.toggleButton(e)}
        >
          {this.state.buttonState.label}
        </Button>
      )
    }
  }

  nextSpeaker = () => {
    const message = {
      action: REMOVEFIRST
    };
    this.ws.send(JSON.stringify(message));
  };


  render() {

    const classes = this.props.classes;

    return (
      <Container maxWidth={'md'}>
        <Card className={this.state.isSpeaking ? classes.cardSpeaker : classes.card}>
          {this.nameField()}
          {this.moderateButton()}
        </Card>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h5" component="h2" color="textSecondary" gutterBottom>
              Sprecherliste
            </Typography>
            <Typography className={classes.pos} color="textSecondary" component={'div'}>
              {this.state.speakers}
            </Typography>
          </CardContent>
        </Card>
      </Container>


    )
  }
}

Chat.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Chat)
