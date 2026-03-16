describe("Employee Portal (main page)", () => {
  it("shows login form at /", () => {
    cy.visit("/");
    cy.contains("Employee Login").should("be.visible");
    cy.get('input[type="text"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.contains("button", "Log In").should("be.visible");
  });

  it("shows Create Account and Admin links", () => {
    cy.visit("/");
    cy.contains("Create Account").should("be.visible");
    cy.contains("a", "Admin").should("be.visible");
  });

  it("switches to registration form and back", () => {
    cy.visit("/");
    cy.contains("button", "Create Account").click();
    cy.contains("Create Account").should("be.visible");
    cy.get('input[type="email"]').should("exist");
    cy.contains("button", "Log In").click();
    cy.contains("Employee Login").should("be.visible");
  });

  it("rejects invalid login", () => {
    cy.visit("/");
    cy.get('input[type="text"]').type("baduser");
    cy.get('input[type="password"]').type("badpass");
    cy.contains("button", "Log In").click();
    cy.contains("Invalid username or password").should("be.visible");
  });

  it("logs in as employee and views profile", () => {
    cy.visit("/");
    cy.get('input[type="text"]').type("jdoe");
    cy.get('input[type="password"]').type("jane123");
    cy.contains("button", "Log In").click();

    cy.contains("Welcome, Jane!").should("be.visible");
    cy.contains("jane.doe@example.com").should("be.visible");
    cy.contains("Department").should("be.visible");
    cy.contains("555-101-2020").should("be.visible");
  });

  it("edits own profile (name/phone) and saves", () => {
    cy.visit("/");
    cy.get('input[type="text"]').type("jdoe");
    cy.get('input[type="password"]').type("jane123");
    cy.contains("button", "Log In").click();

    cy.contains("Welcome, Jane!").should("be.visible");
    cy.contains("button", "Edit My Info").click();

    // Change phone
    cy.get('input[placeholder="555-123-4567"]').clear().type("555-000-9999");
    cy.contains("button", "Save").click();

    cy.contains("Profile updated successfully!").should("be.visible");
    cy.contains("555-000-9999").should("be.visible");

    // Revert phone
    cy.contains("button", "Edit My Info").click();
    cy.get('input[placeholder="555-123-4567"]').clear().type("555-101-2020");
    cy.contains("button", "Save").click();
    cy.contains("555-101-2020").should("be.visible");
  });

  it("registers a new employee and sees profile", () => {
    const unique = Date.now();
    cy.visit("/");
    cy.contains("button", "Create Account").click();

    cy.get('input[type="text"]').first().type("CyFirst");
    cy.get('input[type="text"]').eq(1).type("CyLast");
    cy.get('input[type="email"]').type(`cy${unique}@test.com`);
    cy.get('input[type="text"]').eq(2).type(`cyuser${unique}`);
    cy.get('input[type="password"]').type("cypass123");

    cy.contains("button", "Create Account").click();
    cy.contains("Welcome, CyFirst!").should("be.visible");
  });

  it("employee can log out", () => {
    cy.visit("/");
    cy.get('input[type="text"]').type("jdoe");
    cy.get('input[type="password"]').type("jane123");
    cy.contains("button", "Log In").click();
    cy.contains("Welcome, Jane!").should("be.visible");

    cy.contains("button", "Logout").click();
    cy.contains("Employee Login").should("be.visible");
  });
});

describe("Admin Panel (/admin)", () => {
  beforeEach(() => {
    // Log in as admin via the backend
    cy.request({
      method: "POST",
      url: "/admin/login",
      form: true,
      body: { username: "adminRB", password: "house123" },
      followRedirect: false,
    });
  });

  it("loads admin dashboard with employee table", () => {
    cy.visit("/admin");
    cy.contains("Employee Management System").should("be.visible");
    cy.get(".employee-table tbody tr").its("length").should("be.gte", 1);
  });

  it("expands and closes employee thumbnail", () => {
    cy.visit("/admin");
    cy.get(".avatar-button").first().click();
    cy.get(".image-modal-backdrop").should("be.visible");
    cy.get(".image-modal-preview").should("be.visible");
    cy.get(".image-modal-close").click();
    cy.get(".image-modal-backdrop").should("not.exist");
  });

  it("adds and deletes an employee", () => {
    const unique = Date.now();
    const firstName = `Cy${unique}`;
    const lastName = "Tester";
    const email = `cy${unique}@example.com`;

    cy.visit("/admin");
    cy.contains("button", "Add Employee").click();

    cy.get('input[name="firstName"]').type(firstName);
    cy.get('input[name="lastName"]').type(lastName);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="department"]').type("QA");
    cy.get('input[name="salary"]').clear().type("70000");
    cy.get('input[name="imageUrl"]').clear().type("/images/default.svg");

    cy.contains("button", "Create").click();
    cy.contains("td", `${firstName} ${lastName}`).should("be.visible");

    cy.on("window:confirm", () => true);
    cy.contains("td", `${firstName} ${lastName}`)
      .parents("tr")
      .within(() => {
        cy.contains("button", "Delete").click();
      });

    cy.contains("td", `${firstName} ${lastName}`).should("not.exist");
  });

  it("edits an employee department", () => {
    cy.visit("/admin");
    const updatedDept = `Cypress Dept ${Date.now()}`;

    cy.get(".employee-table tbody tr")
      .first()
      .within(() => {
        cy.contains("button", "Edit").click();
      });

    cy.get('input[name="department"]').clear().type(updatedDept);
    cy.contains("button", "Update").click();
    cy.contains("td", updatedDept).should("be.visible");
  });

  it("shows phone and onboarding columns in table", () => {
    cy.visit("/admin");
    cy.get(".employee-table thead").contains("th", "Phone").should("exist");
    cy.get(".employee-table thead").contains("th", "Onboarding").should("exist");
  });

  it("admin form has phone, address, and onboarding date fields", () => {
    cy.visit("/admin");
    cy.contains("button", "Add Employee").click();
    cy.get('input[name="phone"]').should("exist");
    cy.get('input[name="address"]').should("exist");
    cy.get('input[name="onboardingDate"]').should("exist");
  });
});
