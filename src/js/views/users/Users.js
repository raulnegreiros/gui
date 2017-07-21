import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone'
import userManager from '../../comms/users/UserManager';

import alt from '../../alt';
import AltContainer from 'alt-container';
var UserStore = require('../../stores/UserStore');
var UserActions = require('../../actions/UserActions');

import { PageHeader } from "../../containers/full/PageHeader";
import Filter from "../utils/Filter";

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import MaterialSelect from "../../components/MaterialSelect";


function SummaryItem(props) {
  const selectedClass = "lst-entry-users " + (props.isActive ? " active" : "");
  const name = ((props.user.name && (props.user.name.length > 0)) ? props.user.name : props.user.username);
  return (
    <div className={selectedClass} title="View details">
     <div className="col hovered">
       <div className="col s12">
          <div className="col s9 title2">{name}</div>
       </div>
       <div className="col s12 paddingTop10">
          <div className="col s3 openSans8 truncate">Service:</div>
          <div className="col s9 text-right subtitle"><label className="badge">{props.user.service}</label></div>
       </div>
     </div>
      <div className="col div-img">
        {/* TODO set a custom image */}
        <img src="images/user.png"/>
      </div>
      <div className="lst-entry-users-title col div-with-img">
        <div className="title">{name}</div>
        <div className="subtitle">{props.user.email}</div>
      </div>
    </div>
  )
}

class ListItem extends Component {
  constructor(props) {
    super(props);
    this.handleDetail = this.handleDetail.bind(this);
  }

  handleDetail(e) {
    e.preventDefault();
    this.props.detailedUser(this.props.user);
  }

  render() {
    const active = (this.props.user.id == this.props.detail);
    return (
      <div className="col s12 no-padding clickable" id={this.props.user.id} onClick={this.handleDetail}>
          <SummaryItem user={this.props.user} isActive={active}/>
      </div>
    )
  }
}


class RemoveDialog extends Component {
  constructor(props) {
    super(props);

    this.dismiss = this.dismiss.bind(this);
    this.remove = this.remove.bind(this);
  }

  componentDidMount() {
    // materialize jquery makes me sad
    let modalElement = ReactDOM.findDOMNode(this.refs.modal);
    $(modalElement).ready(function() {
      $('.modal').modal();
    })
  }

  dismiss(event) {
    event.preventDefault();
    let modalElement = ReactDOM.findDOMNode(this.refs.modal);
    $(modalElement).modal('close');
  }

  remove(event) {
    event.preventDefault();
    let modalElement = ReactDOM.findDOMNode(this.refs.modal);
    $(modalElement).modal('close');
    this.props.callback(event);
  }

  render() {
    return (
      <div className="modal" id={this.props.target} ref="modal">
        <div className="modal-content full">
          <div className="row center background-info">
            <div><i className="fa fa-exclamation-triangle fa-4x" /></div>
            <div>You are about to remove this user.</div>
            <div>Are you sure?</div>
          </div>
        </div>
        <div className="modal-footer right">
            <button type="button" className="btn-flat btn-ciano waves-effect waves-light" onClick={this.dismiss}>cancel</button>
            <button type="submit" className="btn-flat btn-red waves-effect waves-light" onClick={this.remove}>remove</button>
        </div>
      </div>
    )
  }
}


class DetailItem extends Component {
  constructor(props) {
    super(props);

    this.handleEdit = this.handleEdit.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  handleDismiss(e) {
    e.preventDefault();
    this.props.clearSelection();
  }

  handleEdit(e) {
    e.preventDefault();
    this.props.editUser(this.props.user.id);
  }

  handleRemove(e) {
    e.preventDefault();
    this.props.deleteUser(this.props.user);
  }

  render() {
    return (
      <span>
        <div className="lst-user-detail" >
          <div className="lst-line col s12">
            <div className="col s3">
                <p><img className="photo_big" src="images/user.png"/></p>
            </div>
            <div className="lst-user-title col s6">
              <span>{this.props.user.name}</span>
              <p className="subTitle">ID:<b>{this.props.user.id}</b></p>
            </div>
            <div className="lst-title col s3">
              <div className="edit right inline-actions">
                <a className="btn-floating waves-red right" onClick={this.handleEdit} title="Edit user">
                  <i className="material-icons">mode_edit</i>
                </a>
                <a className="btn-floating waves-red right" onClick={(e) => {e.preventDefault(); $('#confirmDiag').modal('open');}}  title="Remove user">
                  <i className="fa fa-trash" />
                </a>
              </div>
            </div>
          </div>

          <div className="lst-user-line col s12">
            <span className="field">Name</span>
          </div>
          <div className="lst-user-line col s12">
            <span className='value'> {this.props.user.name} </span>
          </div>
          <div className="lst-user-line col s12">
            <span className="field">Email</span>
          </div>
          <div className="lst-user-line col s12 data">
            <span className='value'> {this.props.user.email} </span>
          </div>
          <div className="lst-user-line col s12">
            <span className="field">Username</span>
          </div>
          <div className="lst-user-line col s12 data">
            <span className='value'> {this.props.user.username} </span>
          </div>
          <div className="lst-user-line col s12">
            <span className="field">Service</span>
          </div>
          <div className="lst-user-line col s12 data">
            <span className='value'> {this.props.user.service} </span>
          </div>
          <div className="lst-user-line col s12">
            <span className="field">Profile</span>
          </div>
          <div className="lst-user-line col s12 data">
            <span className="value">{this.props.user.profile}</span>
          </div>
        </div>
      </span>
    )
  }
}

const FormActions = alt.generateActions('set', 'update', 'reset', 'invalidate');
class FStore {
  constructor() {
    this.user = {};
    this.bindListeners({
      set: FormActions.SET,
      update: FormActions.UPDATE,
      invalidate: FormActions.INVALIDATE,
    });
    this.set(null);
  }

  set(user) {
    if (user === null || user === undefined) {
      this.user = {
        name: "",
        email: "",
        username: "",
        passwd: "",
        service: "",
        profile: "admin"
      };
      // map used to tell whether a field is invalid or not
      this.invalid = {}
    } else {
      this.user = user;
    }
  }

  update(diff) {
    this.user[diff.f] = diff.v;
  }

  invalidate(pair) {
    this.invalid[pair.key] = pair.value;
  }
}
var FormStore = alt.createStore(FStore, 'FormStore');

class UserForm extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <AltContainer store={FormStore}>
        <UserFormImpl {...this.props} />
      </AltContainer>
    )
  }
}

class UserFormImpl extends Component {
  constructor(props) {
    super(props);
    this.saveUser = this.saveUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validate = this.validate.bind(this);
    this.isValid = this.isValid.bind(this);
    this.getValidClass = this.getValidClass.bind(this);
  }

  componentDidMount() {
    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  validate(name, value) {
    let handlers = {
      email: function(value) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return (value.length > 0) && re.test(value);
      },
      username: function(value) {
        let re = /^[a-z0-9_]+$/;
        return re.test(value);
      },
      passwd: function(value) {
        return value.length > 0;
      },
      name: function(value) {
        return value.length > 0;
      },
      service: function(value) {
        let re = /^[a-z0-9_]+$/;
        return re.test(value);
      }
    }

    if (name in handlers) {
      return handlers[name](value);
    }

    return true;
  }

  saveUser(e) {
    e.preventDefault();
    let valid = true;
    for (let k in this.props.user) {
      if (this.props.user.hasOwnProperty(k)) {
        if (this.validate(k,this.props.user[k]) == false) {
          FormActions.invalidate({key: k, value: true});
          valid = false;
        }
      }
    }

    if (valid) {
      this.props.save(this.props.user);
    } else {
      this.forceUpdate();
      Materialize.toast('Failed to validate user data', 4000);
    }
  }

  handleChange(e) {
    e.preventDefault();
    const f = e.target.name;
    const v = e.target.value;
    FormActions.update({f: f, v: v});
  }

  isValid(name) {
    if (name in this.props.invalid) {
      return this.props.invalid[name];
    }

    return false;
  }

  getValidClass(name) {
    if (this.isValid(name) == false) return "validate";
    return "validate " + "invalid"
  }

  render() {
    return (
      <span>
        <form onSubmit={this.saveUser}>
          <div className="lst-line col s12">
              <div className="col s2">
                <p><img id="imgForm" src="images/user.png"/></p>
              </div>
              <div className="lst-user-title col s10">
                <span>{this.props.title}</span>
                <p className="subTitle"><b>ID:</b>{this.props.user.id}</p>
              </div>
          </div>

          <div className="lst-user-detail" >
            <div className="lst-user-line col s12 input-field">
              <input id="fld_Name" type="text" className={this.getValidClass('name')} pattern=".*"
                     name="name" value={this.props.user.name}
                     key="name" onChange={this.handleChange} />
              <label htmlFor="fld_Name"
                     data-error="Required field"
                     data-success="">Name</label>
            </div>
            <div className="lst-user-line col s12 input-field">
              <input id="fld_Email" type="email" className={this.getValidClass('email')}
                     name="email" value={this.props.user.email}
                     key="email" onChange={this.handleChange} />
              <label htmlFor="fld_Email"
                     data-error="Invalid email address"
                     data-success="">Email</label>
            </div>
            <div className="lst-user-line col s12 input-field">
              <input id="fld_login" type="text" className={this.getValidClass('username')} pattern="[a-z0-9_]+"
                     name="username" value={this.props.user.username}
                     key="username" onChange={this.handleChange} />
              <label htmlFor="fld_login"
                     data-error="Invalid login. Must contain only lowercase alphanumeric characters or underscores."
                     data-success="">Username</label>
            </div>
            <div className="lst-user-line col s12 input-field">
              <input id="fld_password" type="password" className={this.getValidClass('passwd')} pattern=".*"
                     name="passwd" value={this.props.user.passwd}
                     key="passwd" onChange={this.handleChange} />
              <label htmlFor="fld_password"
                     data-error="Required field"
                     data-success="">Password</label>
            </div>
            <div className="lst-user-line col s12 input-field">
              <input id="fld_service" type="text" className={this.getValidClass('service')} pattern="[a-z0-9_]+"
                     name="service" value={this.props.user.service}
                     key="service" onChange={this.handleChange} />
              <label htmlFor="fld_service"
                     data-error="Invalid service. Must contain only lowercase alphanumeric characters or underscores."
                     data-success="">Service</label>
            </div>
            <div className="lst-user-line col s12 input-field">
              <MaterialSelect id="flr_profile" name="profile"
                              value={this.props.user.profile}
                              onChange={this.handleChange} >
                <option value="admin">admin</option>
                <option value="user">user</option>
              </MaterialSelect>
              <label htmlFor="fld_profile">Profile type</label>
            </div>
          </div>

          <div className="row right">
            <div className="col">
              <button type="submit" className="waves-light btn waves">Save</button>
            </div>
            <div className="col">
              <a onClick={this.props.dismiss} className="waves-light btn waves">Dismiss</a>
            </div>
          </div>
        </form>
      </span>
    )
  }
}

class UserList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      detail: undefined,
      edit: undefined,
      create: undefined,
      current: 1,
      usersByPage: 6,
      listOfUser: undefined,
      listOfUserByPage: undefined,
      height: undefined
    };

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.detailedUser = this.detailedUser.bind(this);
    this.editUser = this.editUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.handleCreate = this.handleCreate.bind(this);

    this.applyFiltering = this.applyFiltering.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.applyPagination = this.applyPagination.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.isFirstPage = this.isFirstPage.bind(this);
    this.isLastPage = this.isLastPage.bind(this);

    this.newUser = this.newUser.bind(this);
  }

  handleFieldChange(e) {
    let state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  clearSelection() {
    let temp = this.state;
    temp.edit = undefined;
    temp.detail = undefined;
    temp.create = undefined;
    this.setState(temp);
    return true;
  }

  detailedUser(user) {
    let temp = this.state;
    temp.detail = user.id;
    FormActions.set(user);
    temp.user = user;
    temp.create = undefined;
    temp.edit = undefined;
    this.setState(temp);
    return true;
  }

  editUser(id) {
    if (this.state.detail === id) {
      let temp = this.state;
      temp.edit = id;
      temp.create = undefined;
      this.setState(temp);
      return true;
    }
    return false;
  }

  updateUser(user) {
      UserActions.triggerUpdate(user);
  }

  deleteUser(e) {
    e.preventDefault();
    UserActions.triggerRemoval(this.state.user, () => {
      Materialize.toast('User removed', 4000);
    });
    const state = {detail: undefined, create: undefined};
    this.setState(state);
  }

  handleCreate() {
    FormActions.set(null);
    this.clearSelection();
    let temp = this.state;
    temp.create = true;
    this.setState(temp);
    return true;
  }

  applyFiltering(list) {
    // TODO make filtering work for users
    return list;
    const filter = this.state.filter;
    const idFilter = filter.match(/id:\W*([-a-fA-F0-9]+)\W?/);
    return this.props.users.filter(function(e) {
      let result = false;
      if (idFilter && idFilter[1]) {
        result = result || e.id.toUpperCase().includes(idFilter[1].toUpperCase());
      }

      return result || e.name.toUpperCase().includes(filter.toUpperCase());
    });
  }

  handleSearchChange(event) {
    const filter = event.target.value;
    let state = this.state;
    state.filter = filter;
    state.detail = undefined;
    this.setState(state);
  }

  applyPagination() {
    let state = this.state;
    const listPaginate = [];
    let count = 0;
    let initIndex = (this.state.current-1) * this.state.usersByPage;
    let finalIndex = this.state.current * this.state.usersByPage;
    for (let i = initIndex; i < finalIndex; i++) {
      if (this.state.listOfUser[i] != undefined) {
        listPaginate[count] = this.state.listOfUser[i];
      }
      count++;
    }
    this.state.listOfUserByPage = listPaginate;
  }

  isFirstPage() {
    return this.state.current == 1;
  }

  isLastPage() {
    return this.state.listOfUser.length <= ((this.state.current) * this.state.usersByPage);
  }


  prevPage(list) {
    let state = this.state;
    if (!this.isFirstPage()) {
      state.current--;
      this.applyPagination();
    }
    this.setState(state);
  }

  nextPage() {
    let state = this.state;
      if (!this.isLastPage()) {
        state.current++;
        this.applyPagination();
        this.setState(state);
      }
  }

  componentDidMount() {
    // TODO: use this later on to set the number of entries to be presented in each page
    // const height = document.getElementsByClassName('userCanvas')[0].clientHeight;
  }

  newUser(user) {
    UserActions.addUser(user);
    const state = {detail: undefined, create: undefined};
    this.setState(state);
  }

  render() {

    this.state.listOfUser = this.applyFiltering(this.props.users);
    this.applyPagination();
    let displayed = this.state.usersByPage;
    if (this.state.listOfUser.length < displayed)
      displayed = this.state.listOfUser.length;

    let detailAreaStatus = "";
    if (this.state.create || this.state.edit) detailAreaStatus = " create";
    if (this.state.detail) detailAreaStatus = " selected";
    const prevPageClass = (this.isFirstPage() ? " inactive" : "");
    const nextPageClass = (this.isLastPage() ? " inactive" : "");


    return (
      <div className="fill">
        <RemoveDialog callback={this.deleteUser} target="confirmDiag" />
        <div className="flex-wrapper">
          {/* TODO promote this */}
          <div className="row z-depth-2 userSubHeader p0" id="inner-header">
            <div className="col s4 m4 main-title">List of Users</div>
            <div className="col s2 m2 header-card-info">
              <div className="title"># Users</div>
              <div className="subtitle">{this.state.listOfUser.length}</div>
            </div>
            <div className="col s4 header-card-info"></div>
            <div className="col s6 m2 button">
              <a id="btnNewUser" className="waves-effect waves-light btn-flat" onClick={this.handleCreate}>New User</a>
            </div>
          </div>

          <div className={"fill row userCanvas z-depth-2" + detailAreaStatus}>
            { this.state.listOfUserByPage.length > 0 ? (
                <div className="col s4 no-padding" id="user-list">
                  { this.state.listOfUserByPage.map((user) =>
                      <ListItem user={user}
                                key={user.id}
                                detail={this.state.detail}
                                detailedUser={this.detailedUser}/>
                  )}
                  <div className="col s4 userCanvasFooter">
                    <div id="labelShowing" className="col s12 m6">Showing {this.state.listOfUserByPage.length} of {this.state.listOfUser.length}</div>
                    <div id="prevPageId" className="col s6 m3 clickable">
                      <a className={prevPageClass} onClick={this.prevPage}><i className="fa fa-chevron-left paddingRight10"></i>PREV</a>
                    </div>
                    <div id="nextPageId" className="col s6 m3 clickable">
                      <a className={nextPageClass} onClick={this.nextPage}>NEXT<i className="fa fa-chevron-right paddingLeft10"></i></a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col s4 background-info">
                  <span className="background-info">No configured users</span>
                </div>
              )
            }

            <div className={"col s8" + detailAreaStatus} id="detail-area">
              {this.state.create != undefined ? (
                  <UserForm dismiss={this.clearSelection}
                            save={this.newUser}
                            title="New User" />
              ) : this.state.edit != undefined ? (
                  <UserForm dismiss={this.clearSelection}
                            save={UserActions.triggerUpdate}
                            title={this.state.user.name} />
                  ) : (
                  this.state.detail != undefined ? (
                    <DetailItem user={this.state.user}
                                editUser={this.editUser}
                                clearSelection={this.clearSelection}
                                deleteUser={this.deleteUser}/>
                  ) : (
                    <div className="initialUserMessage">
                      <p>Select a user</p>
                      <p>to see its details</p>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class Users extends Component {

  constructor(props) {
    super(props);

    this.state = UserStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    UserStore.listen(this.onChange);
    UserActions.fetchUsers.defer();
  }

  componentWillUnmount() {
    UserStore.unlisten(this.onChange);
  }

  onChange(newState) {
    this.setState(UserStore.getState());
  }

  filterChange(newFilter) {
  }

  render() {
    return (
      <span id="userMain" className="flex-wrapper">
          <PageHeader title="Auth" subtitle="Users">
            <Filter onChange={this.filterChange} />
          </PageHeader>
          <UserList users={this.state.users} />
      </span>
    );
  }
}

export default Users;
