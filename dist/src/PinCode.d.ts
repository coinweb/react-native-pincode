import * as React from "react";
import { Animated, StyleProp, TextStyle, ViewStyle } from "react-native";
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
    moveData: {
        x: number;
        y: number;
    };
    showError?: boolean;
    textButtonSelected: string;
    colorDelete: string;
    attemptFailed?: boolean;
    changeScreen?: boolean;
}
export declare enum PinStatus {
    choose = "choose",
    confirm = "confirm",
    enter = "enter"
}
declare class PinCode extends React.PureComponent<IProps, IState> {
    static defaultProps: Partial<IProps>;
    private readonly _circleSizeEmpty;
    private readonly _circleSizeFull;
    private buttonOpacityAnim;
    private titleOpacityAnim;
    private titleOpacityTextAnim;
    private deleteOpacityAnim;
    private deleteOpacityRef;
    private circleAnims;
    private animationHandles;
    private isUnmounted;
    constructor(props: IProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void;
    componentWillUnmount(): void;
    updateCircleAnimations: (prevState: IState) => void;
    failedAttempt: () => Promise<void>;
    newAttempt: () => Promise<void>;
    onPressButtonNumber: (text: string) => Promise<void>;
    renderButtonNumber: (text: string) => React.JSX.Element;
    endProcess: (pwd: string) => void;
    showError(isErrorValidation?: boolean): Promise<void>;
    renderCirclePassword: () => React.JSX.Element;
    renderButtonDelete: (opacity: Animated.Value) => React.JSX.Element;
    renderTitle: (colorTitle: string, opacityTitle: Animated.Value, attemptFailed?: boolean, showError?: boolean) => React.JSX.Element;
    renderSubtitle: (colorTitle: string, opacityTitle: Animated.Value, attemptFailed?: boolean, showError?: boolean) => React.JSX.Element;
    render(): React.JSX.Element;
}
export default PinCode;
