import React, { Component } from 'react';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import HTTP from '../../../services/http'
class Login extends Component {
  constructor(props){
    super();
    this.state = {
      form : {
        email: '',
        password: ''
      }
    }
    //this.doLogin = this.doLogin.bind(this);
  }

  doLogin(event){
      console.log(this.state.form, "Login form submitted");
      event.preventDefault();      
      HTTP.post('user/login', this.state.form)
      .then((isLogin)=>{
        console.log(isLogin, "isLogin");
        let data = isLogin.data.data;
          if(data.id) {
              localStorage.setItem('LOGGEDIN_USER', JSON.stringify(data));
              this.props.history.push('/');
        }
      })
      .catch((error)=> {
          this.showSnack("Error in user signup");
      });      
  }


  handleChange(prop, event){
    this.setState({
      form:{
        ...this.state.form,
        [prop] : event.target.value
      }
    })
  }

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form onSubmit={(event)=>this.doLogin(event)}>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Email" autoComplete="email" value={this.state.form.email} onChange={this.handleChange.bind(this,'email')} />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Password" autoComplete="current-password"  value={this.state.form.password} onChange={this.handleChange.bind(this,'password')}/>
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4">Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0">Forgot password?</Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: 44 + '%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.</p>
                      <Button color="primary" className="mt-3" active>Register Now!</Button>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
