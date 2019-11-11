import { Icon, Layout, Menu, Select, Spin } from 'antd';
import React from 'react';
import { hot } from 'react-hot-loader/root';
import intl from 'react-intl-universal';
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';

import { INTL_LOCALE_SELECT, INTL_LOCALES } from '#assets/config';
import { LanguageContext } from '#assets/context';
import Console from '#assets/modules/Console';
import Explore from '#assets/modules/Explore';
import { updateQueryStringParameter } from '#assets/utils';

import './App.less';
import ConfigServer from './modules/ConfigServer';
import PrivateRoute from './PrivateRoute';

const { Header, Content } = Layout;
const { Option } = Select;

interface IState {
  loading: boolean;
  activeMenu: string;
}

type IProps = RouteComponentProps;

class App extends React.Component<IProps, IState> {
  currentLocale;
  constructor(props: IProps) {
    super(props);

    const regx = /lang=(\w+)/g;
    const match = regx.exec(props.history.location.search);
    const defaultLocale = match
      ? match[1].toUpperCase()
      : INTL_LOCALE_SELECT.EN_US.NAME;
    this.currentLocale = defaultLocale;
    this.state = {
      loading: true,
      activeMenu: props.location.pathname.split('/').pop() || '',
    };
  }

  toggleLanguage = (locale: string) => {
    window.location.href = updateQueryStringParameter(
      window.location.href,
      'lang',
      locale,
    );
  };

  loadIntlLocale = () => {
    intl
      .init({
        currentLocale: this.currentLocale,
        locales: INTL_LOCALES,
      })
      .then(() => {
        this.setState({
          loading: false,
        });
      });
  };

  handleMenuClick = ({ key }) => {
    this.setState({
      activeMenu: key,
    });
  };

  componentDidMount() {
    this.loadIntlLocale();
  }

  render() {
    const { loading, activeMenu } = this.state;

    return (
      <Router>
        <LanguageContext.Provider
          value={{
            currentLocale: this.currentLocale,
            toggleLanguage: this.toggleLanguage,
          }}
        >
          {loading ? (
            <Spin />
          ) : (
            <Layout className="nebula-web-console">
              <Header>
                <Menu
                  mode="horizontal"
                  selectedKeys={[activeMenu]}
                  onClick={this.handleMenuClick as any}
                >
                  <Menu.Item key="console">
                    <Link to="/console">
                      <Icon type="code" />
                      {intl.get('common.console')}
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="explore">
                    <Link to="explore">
                      <Icon type="eye" />
                      {intl.get('common.explore')}
                    </Link>
                  </Menu.Item>
                </Menu>
                <div className="lang-select">
                  <span>{intl.get('common.languageSelect')}: </span>
                  <Select
                    value={this.currentLocale}
                    onChange={this.toggleLanguage}
                  >
                    {Object.keys(INTL_LOCALE_SELECT).map(locale => (
                      <Option
                        key={locale}
                        value={INTL_LOCALE_SELECT[locale].NAME}
                      >
                        {INTL_LOCALE_SELECT[locale].TEXT}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Header>
              <Content>
                <Switch>
                  <PrivateRoute path="/console" component={Console} />
                  <PrivateRoute path="/explore" component={Explore} />
                  <Route path="/config-server" component={ConfigServer} />
                  <Redirect to="/console" />
                </Switch>
              </Content>
            </Layout>
          )}
        </LanguageContext.Provider>
      </Router>
    );
  }
}

export default withRouter(hot(App));
