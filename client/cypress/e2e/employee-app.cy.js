describe("EMS application", () => {
  it("loads dashboard and employee table", () => {
    cy.visit("/");

    cy.contains("Employee Management System").should("be.visible");
    cy.get(".employee-table tbody tr").its("length").should("be.gte", 1);
  });

  it("expands and closes employee thumbnail", () => {
    cy.visit("/");

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

    cy.visit("/");
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
    cy.visit("/");

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
});
