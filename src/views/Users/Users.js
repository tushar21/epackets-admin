import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from 'reactstrap';
import HTTP from '../../services/http';


class Users extends Component {
  constructor(props){
    super(props);
    this.state ={
      users : []
    }
    this.updateUserStatus = this.updateUserStatus.bind(this);
  }


  updateUserStatus(user){
    console.log(user, "user");

    HTTP.put('user/'+user.id, {status : ((user.status == '1') ? '0' : '1')})
    .then(function(data){
      console.log(data, "Update user status data");
    })
  }

  componentDidMount(){
    HTTP.get('user')
    .then((users)=>{
      this.setState({
        users : users.data.data
      })
    })
  }

  getBadge(status) {
    return status === '1' ? 'success' :
      status === '0' ? 'secondary' :
        status === 'Pending' ? 'warning' :
          status === 'Banned' ? 'danger' :
            'primary'
  } 

  render() {
    const {users} = this.state;
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Users
              </CardHeader>
              <CardBody>
                {users.length ? 
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th scope="col">name</th>
                      <th scope="col">status</th>
                      <th scope="col">action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length ? users.map((user, index) =>
                      <tr key={user.id.toString()}>
                        <td>{user.first_name + ' ' + user.last_name}</td>
                        <td><Badge color={this.getBadge(user.status)}>{(user.status == '1')? 'Active' : 'Inactive'}</Badge></td>
                        <td><button onClick={()=>this.updateUserStatus(user)}>{(user.status == '1')? 'DeActivate' : 'Activate'}</button></td>
                    </tr>
                    ): 'No users found'}
                  </tbody>
                </Table>
                : 'No users found' }
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Users;
