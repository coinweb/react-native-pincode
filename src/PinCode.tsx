import delay from "./delay";
import { colors } from "./design/colors";
import { grid } from "./design/grid";

import * as _ from "lodash";
import * as React from "react";
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,
  Vibration,
  View,
  ViewStyle,
} from "react-native";
import { Col, Row, Grid } from "react-native-easy-grid";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
const Icon = MaterialIcons as React.ComponentType<any>;

/**
 * Pin Code Component
 */

export interface IProps {
  alphabetCharsVisible?: boolean;
  buttonDeleteComponent?: any;
  buttonDeleteText?: string;
  buttonNumberComponent?: any;
  cancelFunction?: () => void;
  colorCircleButtons?: string;
  colorPassword: string;
  colorPasswordEmpty?: string;
  colorPasswordError: string;
  customBackSpaceIcon?: Function;
  emptyColumnComponent: any;
  endProcess: (pinCode: string, isErrorValidation?: boolean) => void;
  launchTouchID?: () => void;
  getCurrentLength?: (length: number) => void;
  iconButtonDeleteDisabled?: boolean;
  numbersButtonOverlayColor: string;
  passwordComponent?: any;
  passwordLength: number;
  pinCodeStatus?: "initial" | "success" | "failure" | "locked";
  pinCodeVisible?: boolean;
  previousPin?: string;
  sentenceTitle: string;
  status: PinStatus;
  styleAlphabet?: StyleProp<TextStyle>;
  styleButtonCircle?: StyleProp<ViewStyle>;
  styleCircleHiddenPassword?: StyleProp<ViewStyle>;
  styleCircleSizeEmpty?: number;
  styleCircleSizeFull?: number;
  styleColorButtonTitle?: string;
  styleColorButtonTitleSelected?: string;
  styleColorSubtitle: string;
  styleColorSubtitleError: string;
  styleColorTitle: string;
  styleColorTitleError: string;
  styleColumnButtons?: StyleProp<ViewStyle>;
  styleColumnDeleteButton?: StyleProp<ViewStyle>;
  styleContainer?: StyleProp<ViewStyle>;
  styleDeleteButtonColorHideUnderlay: string;
  styleDeleteButtonColorShowUnderlay: string;
  styleDeleteButtonIcon: string;
  styleDeleteButtonSize: number;
  styleDeleteButtonText?: StyleProp<TextStyle>;
  styleEmptyColumn?: StyleProp<ViewStyle>;
  stylePinCodeCircle?: StyleProp<ViewStyle>;
  styleRowButtons?: StyleProp<ViewStyle>;
  styleTextButton?: StyleProp<TextStyle>;
  styleTextSubtitle?: StyleProp<TextStyle>;
  styleTextTitle?: StyleProp<TextStyle>;
  styleViewTitle?: StyleProp<ViewStyle>;
  subtitle: string;
  subtitleComponent?: any;
  subtitleError: string;
  textPasswordVisibleFamily: string;
  textPasswordVisibleSize: number;
  titleAttemptFailed?: string;
  titleComponent?: any;
  titleConfirmFailed?: string;
  titleValidationFailed?: string;
  validationRegex?: RegExp;
  vibrationEnabled?: boolean;
  delayBetweenAttempts?: number;
  callbackError?: () => void;
}

export interface IState {
  password: string;
  moveData: { x: number; y: number };
  showError?: boolean;
  textButtonSelected: string;
  colorDelete: string;
  attemptFailed?: boolean;
  changeScreen?: boolean;
}

export enum PinStatus {
  choose = "choose",
  confirm = "confirm",
  enter = "enter",
}

class PinCode extends React.PureComponent<IProps, IState> {
  static defaultProps: Partial<IProps> = {
    alphabetCharsVisible: false,
    styleButtonCircle: null,
    colorCircleButtons: "rgb(242, 245, 251)",
    styleDeleteButtonColorHideUnderlay: "rgb(211, 213, 218)",
    numbersButtonOverlayColor: colors.turquoise,
    styleDeleteButtonColorShowUnderlay: colors.turquoise,
    styleTextButton: null,
    styleColorButtonTitleSelected: colors.white,
    styleColorButtonTitle: colors.grey,
    colorPasswordError: colors.alert,
    colorPassword: colors.turquoise,
    styleCircleHiddenPassword: null,
    styleColumnDeleteButton: null,
    styleDeleteButtonIcon: "backspace",
    styleDeleteButtonSize: 30,
    styleDeleteButtonText: null,
    buttonDeleteText: "delete",
    styleTextTitle: null,
    styleTextSubtitle: null,
    styleContainer: null,
    styleColorTitle: colors.grey,
    styleColorSubtitle: colors.grey,
    styleColorTitleError: colors.alert,
    styleColorSubtitleError: colors.alert,
    styleViewTitle: null,
    styleRowButtons: null,
    styleColumnButtons: null,
    styleEmptyColumn: null,
    textPasswordVisibleFamily: "system font",
    textPasswordVisibleSize: 22,
    vibrationEnabled: true,
    delayBetweenAttempts: 3000,
    callbackError: null,
  };

  private readonly _circleSizeEmpty: number;
  private readonly _circleSizeFull: number;
  private buttonOpacityAnim: Animated.Value;
  private titleOpacityAnim: Animated.Value;
  private titleOpacityTextAnim: Animated.Value;
  private deleteOpacityAnim: Animated.Value;
  private deleteOpacityRef: { current: number };
  private circleAnims: Map<
    number,
    {
      opacity: Animated.Value;
      height: Animated.Value;
      width: Animated.Value;
      borderRadius: Animated.Value;
      marginRight: Animated.Value;
      marginLeft: Animated.Value;
      x: Animated.Value;
      y: Animated.Value;
    }
  >;

  constructor(props: IProps) {
    super(props);
    this.state = {
      password: "",
      moveData: { x: 0, y: 0 },
      showError: false,
      textButtonSelected: "",
      colorDelete: this.props.styleDeleteButtonColorHideUnderlay,
      attemptFailed: false,
      changeScreen: false,
    };
    this.deleteOpacityRef = { current: 0.5 };
    this._circleSizeEmpty = this.props.styleCircleSizeEmpty || 4;
    this._circleSizeFull = this.props.styleCircleSizeFull || (this.props.pinCodeVisible ? 6 : 8);

    // Initialize animated values
    this.buttonOpacityAnim = new Animated.Value(1);
    this.titleOpacityAnim = new Animated.Value(0); // Start at 0, animate to 1 on mount
    this.titleOpacityTextAnim = new Animated.Value(1);
    this.deleteOpacityAnim = new Animated.Value(0.5);

    // Initialize circle animations
    this.circleAnims = new Map();
    for (let i = 0; i < props.passwordLength; i++) {
      this.circleAnims.set(i, {
        opacity: new Animated.Value(0.5),
        height: new Animated.Value(this._circleSizeEmpty),
        width: new Animated.Value(this._circleSizeEmpty),
        borderRadius: new Animated.Value(this._circleSizeEmpty / 2),
        marginRight: new Animated.Value(10),
        marginLeft: new Animated.Value(10),
        x: new Animated.Value(0),
        y: new Animated.Value(0),
      });
    }
  }

  componentDidMount() {
    if (this.props.getCurrentLength) this.props.getCurrentLength(0);
    // Initial animation for title - use native driver false to avoid conflicts
    Animated.timing(this.titleOpacityAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Initialize delete button opacity
    const initialDeleteOpacity =
      this.state.password.length === 0 || this.state.password.length === this.props.passwordLength ? 0.5 : 1;
    this.deleteOpacityAnim.setValue(initialDeleteOpacity);
    this.deleteOpacityRef.current = initialDeleteOpacity;
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
    if (prevProps.pinCodeStatus !== "failure" && this.props.pinCodeStatus === "failure") {
      this.failedAttempt();
    }
    if (prevProps.pinCodeStatus !== "locked" && this.props.pinCodeStatus === "locked") {
      this.setState({ password: "" });
    }

    // Animate button opacity when error state changes
    if (prevState.showError !== this.state.showError || prevState.attemptFailed !== this.state.attemptFailed) {
      const targetOpacity = this.state.showError && !this.state.attemptFailed ? 0.5 : 1;
      Animated.timing(this.buttonOpacityAnim, {
        toValue: targetOpacity,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    // Animate title opacity
    if (
      prevState.changeScreen !== this.state.changeScreen ||
      prevState.showError !== this.state.showError ||
      prevState.attemptFailed !== this.state.attemptFailed
    ) {
      const targetOpacity = this.state.changeScreen ? 0 : 1;
      const targetTextOpacity = this.state.showError || this.state.attemptFailed ? grid.highOpacity : 1;

      Animated.timing(this.titleOpacityAnim, {
        toValue: targetOpacity,
        duration: 200,
        useNativeDriver: false,
      }).start();

      Animated.timing(this.titleOpacityTextAnim, {
        toValue: targetTextOpacity,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    // Animate delete button opacity
    if (prevState.password.length !== this.state.password.length) {
      const targetOpacity =
        this.state.password.length === 0 || this.state.password.length === this.props.passwordLength ? 0.5 : 1;
      // Update ref immediately for synchronous access (before animation)
      this.deleteOpacityRef.current = targetOpacity;
      Animated.timing(this.deleteOpacityAnim, {
        toValue: targetOpacity,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }

    // Animate circles
    this.updateCircleAnimations(prevState);
  }

  updateCircleAnimations = (prevState: IState) => {
    const { password, showError, changeScreen, attemptFailed, moveData } = this.state;

    this.circleAnims.forEach((anim, index) => {
      const lengthSup = ((password.length >= index + 1 && !changeScreen) || showError) && !attemptFailed;
      const targetHeight = lengthSup ? this._circleSizeFull : this._circleSizeEmpty;
      const targetWidth = lengthSup ? this._circleSizeFull : this._circleSizeEmpty;
      const targetBorderRadius = lengthSup ? this._circleSizeFull / 2 : this._circleSizeEmpty / 2;
      const targetOpacity = lengthSup ? 1 : 0.5;
      const targetMargin = lengthSup ? 10 - (this._circleSizeFull - this._circleSizeEmpty) / 2 : 10;

      const layoutAnimations: Animated.CompositeAnimation[] = [];
      const transformAnimations: Animated.CompositeAnimation[] = [];

      if (
        prevState.password.length !== password.length ||
        prevState.showError !== showError ||
        prevState.changeScreen !== changeScreen ||
        prevState.attemptFailed !== attemptFailed
      ) {
        // Layout properties that cannot use native driver
        layoutAnimations.push(
          Animated.timing(anim.height, {
            toValue: targetHeight,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim.width, {
            toValue: targetWidth,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim.borderRadius, {
            toValue: targetBorderRadius,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim.marginRight, {
            toValue: targetMargin,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim.marginLeft, {
            toValue: targetMargin,
            duration: 200,
            useNativeDriver: false,
          })
        );

        // Opacity can use native driver, but we'll keep it with layout for simplicity
        layoutAnimations.push(
          Animated.timing(anim.opacity, {
            toValue: targetOpacity,
            duration: 200,
            useNativeDriver: false,
          })
        );
      }

      if (prevState.moveData.x !== moveData.x || prevState.moveData.y !== moveData.y) {
        // Position animations - use native driver false to match layout animations
        layoutAnimations.push(
          Animated.timing(anim.x, {
            toValue: moveData.x,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim.y, {
            toValue: moveData.y,
            duration: 200,
            useNativeDriver: false,
          })
        );
      }

      // Run all animations together since they all use native driver false
      if (layoutAnimations.length > 0) {
        Animated.parallel(layoutAnimations).start();
      }
    });
  };

  failedAttempt = async () => {
    await delay(300);
    this.setState({
      showError: true,
      attemptFailed: true,
      changeScreen: false,
    });
    this.props.callbackError && this.props.callbackError();
    if (this.props.getCurrentLength) this.props.getCurrentLength(0);
    await delay(this.props.delayBetweenAttempts);
    this.newAttempt();
  };

  newAttempt = async () => {
    this.setState({ changeScreen: true });
    await delay(200);
    this.setState({
      changeScreen: false,
      showError: false,
      attemptFailed: false,
      password: "",
    });
  };

  onPressButtonNumber = async (text: string) => {
    const currentPassword = this.state.password + text;
    this.setState({ password: currentPassword });
    if (this.props.getCurrentLength) this.props.getCurrentLength(currentPassword.length);
    if (currentPassword.length === this.props.passwordLength) {
      switch (this.props.status) {
        case PinStatus.choose:
          if (this.props.validationRegex && this.props.validationRegex.test(currentPassword)) {
            this.showError(true);
          } else {
            this.endProcess(currentPassword);
          }
          break;
        case PinStatus.confirm:
          if (currentPassword !== this.props.previousPin) {
            this.showError();
          } else {
            this.endProcess(currentPassword);
          }
          break;
        case PinStatus.enter:
          this.props.endProcess(currentPassword);
          await delay(300);
          break;
        default:
          break;
      }
    }
  };

  renderButtonNumber = (text: string) => {
    let alphanumericMap = new Map([
      ["1", " "],
      ["2", "ABC"],
      ["3", "DEF"],
      ["4", "GHI"],
      ["5", "JKL"],
      ["6", "MNO"],
      ["7", "PQRS"],
      ["8", "TUV"],
      ["9", "WXYZ"],
      ["0", " "],
    ]);
    const disabled =
      (this.state.password.length === this.props.passwordLength || this.state.showError) && !this.state.attemptFailed;
    return (
      <TouchableHighlight
        style={[styles.buttonCircle, { backgroundColor: this.props.colorCircleButtons }, this.props.styleButtonCircle]}
        underlayColor={this.props.numbersButtonOverlayColor}
        disabled={disabled}
        onShowUnderlay={() => this.setState({ textButtonSelected: text })}
        onHideUnderlay={() => this.setState({ textButtonSelected: "" })}
        onPress={() => {
          this.onPressButtonNumber(text);
        }}
        accessible
        accessibilityLabel={text}
      >
        <Animated.View style={{ opacity: this.buttonOpacityAnim }}>
          <Text
            style={[
              styles.text,
              this.props.styleTextButton,
              {
                color:
                  this.state.textButtonSelected === text
                    ? this.props.styleColorButtonTitleSelected
                    : this.props.styleColorButtonTitle,
              },
            ]}
          >
            {text}
          </Text>
          {this.props.alphabetCharsVisible && (
            <Text
              style={[
                styles.tinytext,
                this.props.styleAlphabet,
                {
                  color:
                    this.state.textButtonSelected === text
                      ? this.props.styleColorButtonTitleSelected
                      : this.props.styleColorButtonTitle,
                },
              ]}
            >
              {alphanumericMap.get(text)}
            </Text>
          )}
        </Animated.View>
      </TouchableHighlight>
    );
  };

  endProcess = (pwd: string) => {
    setTimeout(() => {
      this.setState({ changeScreen: true });
      setTimeout(() => {
        this.props.endProcess(pwd);
      }, 500);
    }, 400);
  };

  async showError(isErrorValidation = false) {
    this.setState({ changeScreen: true });
    await delay(300);
    this.setState({ showError: true, changeScreen: false });
    if (this.props.getCurrentLength) this.props.getCurrentLength(0);
    this.props.callbackError && this.props.callbackError();
    await delay(3000);
    this.setState({ changeScreen: true });
    await delay(200);
    this.setState({ showError: false, password: "" });
    await delay(200);
    this.props.endProcess(this.state.password, isErrorValidation);
    if (isErrorValidation) this.setState({ changeScreen: false });
  }

  renderCirclePassword = () => {
    const { password, showError, changeScreen, attemptFailed } = this.state;
    const colorPwdErr = this.props.colorPasswordError;
    const colorPwd = this.props.colorPassword;
    const colorPwdEmp = this.props.colorPasswordEmpty || colorPwd;
    return (
      <View style={[styles.topViewCirclePassword, this.props.styleCircleHiddenPassword]}>
        {_.range(this.props.passwordLength).map((val: number) => {
          const lengthSup = ((password.length >= val + 1 && !changeScreen) || showError) && !attemptFailed;
          const anim = this.circleAnims.get(val);
          if (!anim) return null;

          const color = showError ? colorPwdErr : lengthSup && password.length > 0 ? colorPwd : colorPwdEmp;

          return (
            <Animated.View
              key={val}
              style={[
                styles.viewCircles,
                {
                  opacity: anim.opacity,
                  marginLeft: anim.marginLeft,
                  marginRight: anim.marginRight,
                  left: anim.x,
                  top: anim.y,
                },
              ]}
            >
              {((!this.props.pinCodeVisible || (this.props.pinCodeVisible && !lengthSup)) && (
                <Animated.View
                  style={[
                    {
                      height: anim.height,
                      width: anim.width,
                      borderRadius: anim.borderRadius,
                      backgroundColor: color,
                    },
                    this.props.stylePinCodeCircle,
                  ]}
                />
              )) || (
                <View>
                  <Text
                    style={{
                      color: color,
                      fontFamily: this.props.textPasswordVisibleFamily,
                      fontSize: this.props.textPasswordVisibleSize,
                    }}
                  >
                    {this.state.password[val]}
                  </Text>
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>
    );
  };

  renderButtonDelete = (opacity: Animated.Value) => {
    return (
      <TouchableHighlight
        activeOpacity={1}
        disabled={this.state.password.length === 0}
        underlayColor="transparent"
        onHideUnderlay={() =>
          this.setState({
            colorDelete: this.props.styleDeleteButtonColorHideUnderlay,
          })
        }
        onShowUnderlay={() =>
          this.setState({
            colorDelete: this.props.styleDeleteButtonColorShowUnderlay,
          })
        }
        onPress={() => {
          if (this.state.password.length > 0) {
            const newPass = this.state.password.slice(0, -1);
            this.setState({ password: newPass });
            if (this.props.getCurrentLength) this.props.getCurrentLength(newPass.length);
          }
        }}
        accessible
        accessibilityLabel={this.props.buttonDeleteText}
      >
        <Animated.View style={[styles.colIcon, this.props.styleColumnDeleteButton, { opacity }]}>
          {this.props.customBackSpaceIcon ? (
            this.props.customBackSpaceIcon({
              colorDelete: this.state.colorDelete,
              opacity: this.deleteOpacityRef.current,
            })
          ) : (
            <>
              {!this.props.iconButtonDeleteDisabled && (
                <Icon
                  name={this.props.styleDeleteButtonIcon}
                  size={this.props.styleDeleteButtonSize}
                  color={this.state.colorDelete}
                />
              )}
              <Animated.Text
                style={[
                  styles.textDeleteButton,
                  this.props.styleDeleteButtonText,
                  {
                    color: this.state.colorDelete,
                  },
                ]}
              >
                {this.props.buttonDeleteText}
              </Animated.Text>
            </>
          )}
        </Animated.View>
      </TouchableHighlight>
    );
  };

  renderTitle = (colorTitle: string, opacityTitle: Animated.Value, attemptFailed?: boolean, showError?: boolean) => {
    return (
      <Animated.Text
        style={[styles.textTitle, this.props.styleTextTitle, { color: colorTitle, opacity: opacityTitle }]}
      >
        {(attemptFailed && this.props.titleAttemptFailed) ||
          (showError && this.props.titleConfirmFailed) ||
          (showError && this.props.titleValidationFailed) ||
          this.props.sentenceTitle}
      </Animated.Text>
    );
  };

  renderSubtitle = (colorTitle: string, opacityTitle: Animated.Value, attemptFailed?: boolean, showError?: boolean) => {
    return (
      <Animated.Text
        style={[styles.textSubtitle, this.props.styleTextSubtitle, { color: colorTitle, opacity: opacityTitle }]}
      >
        {attemptFailed || showError ? this.props.subtitleError : this.props.subtitle}
      </Animated.Text>
    );
  };

  render() {
    const { password, showError, attemptFailed } = this.state;
    const colorTitle = showError || attemptFailed ? this.props.styleColorTitleError : this.props.styleColorTitle;
    const colorSubtitle =
      showError || attemptFailed ? this.props.styleColorSubtitleError : this.props.styleColorSubtitle;

    return (
      <View style={[styles.container, this.props.styleContainer]}>
        <Animated.View style={[styles.viewTitle, this.props.styleViewTitle, { opacity: this.titleOpacityAnim }]}>
          {this.props.titleComponent
            ? this.props.titleComponent()
            : this.renderTitle(colorTitle, this.titleOpacityTextAnim, attemptFailed, showError)}
          {this.props.subtitleComponent
            ? this.props.subtitleComponent()
            : this.renderSubtitle(colorSubtitle, this.titleOpacityTextAnim, attemptFailed, showError)}
        </Animated.View>
        <View style={styles.flexCirclePassword}>
          {this.props.passwordComponent ? this.props.passwordComponent() : this.renderCirclePassword()}
        </View>
        <Grid style={styles.grid}>
          <Row style={[styles.row, this.props.styleRowButtons]}>
            {_.range(1, 4).map((i: number) => {
              return (
                <Col key={i} style={[styles.colButtonCircle, this.props.styleColumnButtons]}>
                  {this.props.buttonNumberComponent
                    ? this.props.buttonNumberComponent(i, this.onPressButtonNumber)
                    : this.renderButtonNumber(i.toString())}
                </Col>
              );
            })}
          </Row>
          <Row style={[styles.row, this.props.styleRowButtons]}>
            {_.range(4, 7).map((i: number) => {
              return (
                <Col key={i} style={[styles.colButtonCircle, this.props.styleColumnButtons]}>
                  {this.props.buttonNumberComponent
                    ? this.props.buttonNumberComponent(i, this.onPressButtonNumber)
                    : this.renderButtonNumber(i.toString())}
                </Col>
              );
            })}
          </Row>
          <Row style={[styles.row, this.props.styleRowButtons]}>
            {_.range(7, 10).map((i: number) => {
              return (
                <Col key={i} style={[styles.colButtonCircle, this.props.styleColumnButtons]}>
                  {this.props.buttonNumberComponent
                    ? this.props.buttonNumberComponent(i, this.onPressButtonNumber)
                    : this.renderButtonNumber(i.toString())}
                </Col>
              );
            })}
          </Row>
          <Row style={[styles.row, styles.rowWithEmpty, this.props.styleRowButtons]}>
            <Col style={[styles.colEmpty, this.props.styleEmptyColumn]}>
              {this.props.emptyColumnComponent ? this.props.emptyColumnComponent(this.props.launchTouchID) : null}
            </Col>
            <Col style={[styles.colButtonCircle, this.props.styleColumnButtons]}>
              {this.props.buttonNumberComponent
                ? this.props.buttonNumberComponent("0", this.onPressButtonNumber)
                : this.renderButtonNumber("0")}
            </Col>
            <Col style={[styles.colButtonCircle, this.props.styleColumnButtons]}>
              {this.props.buttonDeleteComponent
                ? this.props.buttonDeleteComponent(() => {
                    if (this.state.password.length > 0) {
                      const newPass = this.state.password.slice(0, -1);
                      this.setState({
                        password: newPass,
                      });
                      if (this.props.getCurrentLength) this.props.getCurrentLength(newPass.length);
                    }
                  })
                : this.renderButtonDelete(this.deleteOpacityAnim)}
            </Col>
          </Row>
        </Grid>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  viewTitle: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 2,
  },
  row: {
    flex: 0,
    flexShrink: 1,
    alignItems: "center",
    height: grid.unit * 5.5,
  },
  rowWithEmpty: {
    flexShrink: 0,
    justifyContent: "flex-end",
  },
  colButtonCircle: {
    flex: 0,
    marginLeft: grid.unit / 2,
    marginRight: grid.unit / 2,
    alignItems: "center",
    width: grid.unit * 4,
    height: grid.unit * 4,
  },
  colEmpty: {
    flex: 0,
    marginLeft: grid.unit / 2,
    marginRight: grid.unit / 2,
    width: grid.unit * 4,
    height: grid.unit * 4,
  },
  colIcon: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  text: {
    fontSize: grid.unit * 2,
    fontWeight: "200",
  },
  tinytext: {
    fontSize: grid.unit / 2,
    fontWeight: "300",
  },
  buttonCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: grid.unit * 4,
    height: grid.unit * 4,
    backgroundColor: "rgb(242, 245, 251)",
    borderRadius: grid.unit * 2,
  },
  textTitle: {
    fontSize: 20,
    fontWeight: "200",
    lineHeight: grid.unit * 2.5,
  },
  textSubtitle: {
    fontSize: grid.unit,
    fontWeight: "200",
    textAlign: "center",
  },
  flexCirclePassword: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  topViewCirclePassword: {
    flexDirection: "row",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
  },
  viewCircles: {
    justifyContent: "center",
    alignItems: "center",
  },
  textDeleteButton: {
    fontWeight: "200",
    marginTop: 5,
  },
  grid: {
    justifyContent: "flex-start",
    width: "100%",
    flex: 7,
  },
});

export default PinCode;
