import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const VALID_FORM_VALUES = {
  name: "Gary Oldman",
  email: "gary.oldman@gmail.com",
  agreeTerms: true,
  gender: "male",
};

const FORM_ERRORS = {
  name: "Name must be at least 3 characters.",
  email: "Email must be valid.",
  agreeTerms: "You must agree to the terms.",
  gender: "You must select a gender.",
};

const consoleLogSpy = jest.spyOn(global.console, "log");

describe("App", () => {
  const getNameInput = () => screen.getByPlaceholderText("Name");
  const getEmailInput = () => screen.getByPlaceholderText("Email");
  const getAgreeTermsCheckbox = () => screen.getByRole("checkbox");
  const getMaleGenderInput = () => screen.getAllByRole("radio")[0];
  const getFemaleGenderInput = () => screen.getAllByRole("radio")[1];
  const getSubmitButton = () => screen.getByRole("button", { name: "Submit" });

  const fillFormWithCorrectDefaultValues = () => {
    userEvent.type(getNameInput(), VALID_FORM_VALUES.name);
    userEvent.type(getEmailInput(), VALID_FORM_VALUES.email);
    userEvent.click(getAgreeTermsCheckbox());
    userEvent.click(getMaleGenderInput());
  };

  const submitForm = () => {
    userEvent.click(getSubmitButton());
  };

  const getFormErrors = () => {
    const errors = [];

    Object.values(FORM_ERRORS).forEach((message) => {
      if (screen.queryByText(message)) {
        errors.push(message);
      }
    });

    return errors;
  };

  describe("Positive Test Cases", () => {
    it("should submit the form with all fields filled in correctly", () => {
      render(<App />);

      act(() => {
        fillFormWithCorrectDefaultValues();
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledWith(VALID_FORM_VALUES);
      expect(getFormErrors()).toHaveLength(0);
    });

    it("should submit the form with a very long valid name", () => {
      render(<App />);

      const veryLongName = "Hubert Blaine Wolfeschlegelsteinhausenbergerdorff";
      const nameInput = getNameInput();

      act(() => {
        fillFormWithCorrectDefaultValues();
        userEvent.clear(nameInput);
        userEvent.type(nameInput, veryLongName);
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledWith({
        ...VALID_FORM_VALUES,
        name: veryLongName,
      });
      expect(getFormErrors()).toHaveLength(0);
    });

    it("should submit the form with a valid and complex email address", () => {
      render(<App />);

      const complexEmailAdress = "test.name+alias@example.co.uk";
      const emailInput = getEmailInput();

      act(() => {
        fillFormWithCorrectDefaultValues();
        userEvent.clear(emailInput);
        userEvent.type(emailInput, complexEmailAdress);
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledWith({
        ...VALID_FORM_VALUES,
        email: complexEmailAdress,
      });
      expect(getFormErrors()).toHaveLength(0);
    });

    it("should change gender", () => {
      render(<App />);

      act(() => {
        fillFormWithCorrectDefaultValues();
        userEvent.click(getFemaleGenderInput());
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledWith({
        ...VALID_FORM_VALUES,
        gender: "female",
      });
      expect(getFormErrors()).toHaveLength(0);
    });

    it("should re-submit the form after an initial successful submission with all fields filled in correctly", () => {
      render(<App />);

      act(() => {
        fillFormWithCorrectDefaultValues();
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledTimes(1);
      submitForm();

      expect(consoleLogSpy).toBeCalledTimes(2);
      expect(consoleLogSpy).toBeCalledWith(VALID_FORM_VALUES);
      expect(getFormErrors()).toHaveLength(0);
    });
  });

  describe("Negative Test Cases", () => {
    it("should display error message about invalid name field", () => {
      render(<App />);

      act(() => {
        fillFormWithCorrectDefaultValues();
        userEvent.clear(getNameInput());
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledWith({ ...VALID_FORM_VALUES, name: "" });
      const formErrors = getFormErrors();
      expect(formErrors).toHaveLength(1);
      expect(formErrors.at(0)).toBe(FORM_ERRORS.name);
    });

    it("should display error message about invalid email field", () => {
      render(<App />);
      const emailInput = getEmailInput();
      const invalidEmail = '"gary.oldman.gmail.com"';

      act(() => {
        fillFormWithCorrectDefaultValues();
        userEvent.clear(emailInput);
        userEvent.type(emailInput, invalidEmail);
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledWith({
        ...VALID_FORM_VALUES,
        email: invalidEmail,
      });
      const formErrors = getFormErrors();
      expect(formErrors).toHaveLength(1);
      expect(formErrors.at(0)).toBe(FORM_ERRORS.email);
    });

    it("hould display error message about invalid agreeTerms field", () => {
      render(<App />);

      act(() => {
        fillFormWithCorrectDefaultValues();
        userEvent.click(getAgreeTermsCheckbox());
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledWith({
        ...VALID_FORM_VALUES,
        agreeTerms: false,
      });
      const formErrors = getFormErrors();
      expect(formErrors).toHaveLength(1);
      expect(formErrors.at(0)).toBe(FORM_ERRORS.agreeTerms);
    });

    it("hould display error message about invalid gender field", () => {
      render(<App />);

      act(() => {
        userEvent.type(getNameInput(), VALID_FORM_VALUES.name);
        userEvent.type(getEmailInput(), VALID_FORM_VALUES.email);
        userEvent.click(getAgreeTermsCheckbox());
        submitForm();
      });

      expect(consoleLogSpy).toBeCalledWith({
        ...VALID_FORM_VALUES,
        gender: "",
      });
      const formErrors = getFormErrors();
      expect(formErrors).toHaveLength(1);
      expect(formErrors.at(0)).toBe(FORM_ERRORS.gender);
    });

    it("should display error message about invalid name field when it is less than 3 characters long", () => {
      render(<App />);
      const shortName = "Ga";
      const nameInput = getNameInput();

      act(() => {
        fillFormWithCorrectDefaultValues();
        userEvent.clear(nameInput);
        userEvent.type(nameInput, shortName);
      });
      submitForm();

      expect(consoleLogSpy).toBeCalledWith({
        ...VALID_FORM_VALUES,
        name: shortName,
      });
      const formErrors = getFormErrors();
      expect(formErrors).toHaveLength(1);
      expect(formErrors.at(0)).toBe(FORM_ERRORS.name);
    });
  });
});
