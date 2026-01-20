import { colors } from "./design/colors";
import { grid } from "./design/grid";
import delay from "./delay";
import { PinResultStatus } from "./utils";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { Animated, StyleSheet, View, TouchableOpacity, Text, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
const Icon = MaterialIcons as React.ComponentType<any>;

export type IProps = {
  buttonComponent?: any;
  changeStatus: (status: PinResultStatus) => void;
  colorIcon?: string;
  iconComponent?: any;
  lockedIconComponent?: any;
  nameIcon?: string;
  onClickButton: any;
  pinAttemptsAsyncStorageName: string;
  sizeIcon?: number;
  styleButton?: any;
  styleMainContainer?: any;
  styleText?: any;
  styleTextButton?: any;
  styleTextTimer?: any;
  styleTitle?: any;
  styleViewButton?: any;
  styleViewIcon?: any;
  styleViewTextLock?: any;
  styleViewTimer?: any;
  textButton: string;
  textDescription?: string;
  textSubDescription?: string;
  textTitle?: string;
  timePinLockedAsyncStorageName: string;
  timeToLock: number;
  timerComponent?: any;
  titleComponent?: any;
};

export type IState = {
  timeDiff: number;
};

class ApplicationLocked extends React.PureComponent<IProps, IState> {
  static defaultProps: Partial<IProps> = {
    styleButton: null,
    styleTextButton: null,
    styleViewTimer: null,
    styleTextTimer: null,
    styleTitle: null,
    styleViewIcon: null,
    nameIcon: "lock",
    sizeIcon: 24,
    colorIcon: colors.white,
    styleViewTextLock: null,
    styleText: null,
    styleViewButton: null,
    styleMainContainer: null,
  };
  timeLocked: number;
  isUnmounted: boolean;
  contentOpacityAnim: Animated.Value;
  buttonOpacityAnim: Animated.Value;
  timeoutIds: number[];

  constructor(props: IProps) {
    super(props);
    this.state = {
      timeDiff: 0,
    };
    this.isUnmounted = false;
    this.timeLocked = 0;
    this.contentOpacityAnim = new Animated.Value(0);
    this.buttonOpacityAnim = new Animated.Value(0);
    this.timer = this.timer.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  componentDidMount() {
    AsyncStorage.getItem(this.props.timePinLockedAsyncStorageName).then((val) => {
      this.timeLocked = new Date(val ? val : "").getTime() + this.props.timeToLock;
      this.timer();
    });

    // Store timeout IDs for cleanup
    this.timeoutIds = [];

    // Animate content opacity after 1000ms delay
    const timeout1 = setTimeout(() => {
        Animated.timing(this.contentOpacityAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }).start();

    }, 1000);
    this.timeoutIds.push(timeout1);

    // Animate button opacity after 2000ms delay
    const timeout2 = setTimeout(() => {
        Animated.timing(this.buttonOpacityAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }).start();

    }, 2000);
    this.timeoutIds.push(timeout2);
  }

  async timer() {
    const timeDiff = +new Date(this.timeLocked) - +new Date();
    this.setState({ timeDiff: Math.max(0, timeDiff) });
    await delay(1000);
    if (timeDiff < 1000) {
      this.props.changeStatus(PinResultStatus.initial);
      AsyncStorage.multiRemove([this.props.timePinLockedAsyncStorageName, this.props.pinAttemptsAsyncStorageName]);
    }
    if (!this.isUnmounted) {
      this.timer();
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    // Clear all timeouts
    if (this.timeoutIds) {
      this.timeoutIds.forEach((id) => clearTimeout(id));
      this.timeoutIds = [];
    }
    // Stop animations
    this.contentOpacityAnim.stopAnimation();
    this.buttonOpacityAnim.stopAnimation();
  }

  renderButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.props.onClickButton) {
            this.props.onClickButton();
          } else {
            throw "Quit application";
          }
        }}
        style={[styles.button, this.props.styleButton]}
        accessible
        accessibilityLabel={this.props.textButton}
      >
        <Text style={[styles.closeButtonText, this.props.styleTextButton]}>{this.props.textButton}</Text>
      </TouchableOpacity>
    );
  };

  renderTimer = (minutes: number, seconds: number) => {
    return (
      <View style={[styles.viewTimer, this.props.styleViewTimer]}>
        <Text style={[styles.textTimer, this.props.styleTextTimer]}>
          {`${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`}
        </Text>
      </View>
    );
  };

  renderTitle = () => {
    return (
      <Text style={[styles.title, this.props.styleTitle]}>{this.props.textTitle || "Maximum attempts reached"}</Text>
    );
  };

  renderIcon = () => {
    return (
      <View style={[styles.viewIcon, this.props.styleViewIcon]}>
        {this.props.lockedIconComponent ? (
          this.props.lockedIconComponent
        ) : (
          <Icon name={this.props.nameIcon} size={this.props.sizeIcon} color={this.props.colorIcon} />
        )}
      </View>
    );
  };

  renderErrorLocked = () => {
    const minutes = Math.floor(this.state.timeDiff / 1000 / 60);
    const seconds = Math.floor(this.state.timeDiff / 1000) % 60;
    return (
      <View>
        <Animated.View
          style={[styles.viewTextLock, this.props.styleViewTextLock, { opacity: this.contentOpacityAnim }]}
        >
          {this.props.titleComponent ? this.props.titleComponent() : this.renderTitle()}
          {this.props.timerComponent ? this.props.timerComponent() : this.renderTimer(minutes, seconds)}
          {this.props.iconComponent ? this.props.iconComponent() : this.renderIcon()}
          <Text style={[styles.text, this.props.styleText]}>
            {this.props.textDescription
              ? this.props.textDescription
              : `To protect your information, access has been locked for ${Math.ceil(
                  this.props.timeToLock / 1000 / 60
                )} minutes.`}
          </Text>
          <Text style={[styles.text, this.props.styleText]}>
            {this.props.textSubDescription ? this.props.textSubDescription : "Come back later and try again."}
          </Text>
        </Animated.View>
        <Animated.View style={{ opacity: this.buttonOpacityAnim, flex: 1 }}>
          <View style={[styles.viewCloseButton, this.props.styleViewButton]}>
            {this.props.buttonComponent ? this.props.buttonComponent() : this.renderButton()}
          </View>
        </Animated.View>
      </View>
    );
  };

  render() {
    return <View style={[styles.container, this.props.styleMainContainer]}>{this.renderErrorLocked()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    backgroundColor: colors.background,
    flexBasis: 0,
    left: 0,
    height: "100%",
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontSize: grid.unit,
    color: colors.base,
    lineHeight: grid.unit * grid.lineHeight,
    textAlign: "center",
  },
  viewTextLock: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: grid.unit * 3,
    paddingRight: grid.unit * 3,
    flex: 3,
  },
  textTimer: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 20,
    color: colors.base,
  },
  title: {
    fontSize: grid.navIcon,
    color: colors.base,
    opacity: grid.mediumOpacity,
    fontWeight: "200",
    marginBottom: grid.unit * 4,
  },
  viewIcon: {
    width: grid.unit * 4,
    justifyContent: "center",
    alignItems: "center",
    height: grid.unit * 4,
    borderRadius: grid.unit * 2,
    opacity: grid.mediumOpacity,
    backgroundColor: colors.alert,
    overflow: "hidden",
    marginBottom: grid.unit * 4,
  },
  viewTimer: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 10,
    paddingTop: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "rgb(230, 231, 233)",
    marginBottom: grid.unit * 4,
  },
  viewCloseButton: {
    alignItems: "center",
    opacity: grid.mediumOpacity,
    justifyContent: "center",
    marginTop: grid.unit * 2,
  },
  button: {
    backgroundColor: colors.turquoise,
    borderRadius: grid.border,
    paddingLeft: grid.unit * 2,
    paddingRight: grid.unit * 2,
    paddingBottom: grid.unit,
    paddingTop: grid.unit,
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ApplicationLocked;
