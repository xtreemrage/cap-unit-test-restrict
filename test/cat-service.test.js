const cds = require("@sap/cds");
const serviceFileName = "cat-service";
const serviceName = "CatalogService";

describe("Books service", () => {
    describe("Odata Protocol Level Testing", () => {
        const app = require("express")();
        const request = require("supertest")(app);

        beforeAll(async () => {
            await cds.deploy(`${__dirname}/../srv/${serviceFileName}`).to("sqlite::memory:");
            await cds.serve(serviceName).from(`${__dirname}/../srv/${serviceFileName}`).in(app);
        });

        it("should return a $metadata document", async () => {
            // Arrange
            const expectedVersion = "<edmx:Edmx Version=\"4.0\" xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\">";
            const expectedNotificationsEntitySet = "<EntitySet Name=\"Books\" EntityType=\"CatalogService.Books\"";
            const expectedAssertions = 2;

            // Act
            const response = await request
                .get("/catalog/$metadata")
                .expect("Content-Type", /^application\/xml/)
                .expect(200);

            // Assert;
            expect.assertions(expectedAssertions);
            expect(response.text.includes(expectedVersion)).toBeTruthy();
            expect(response.text.includes(expectedNotificationsEntitySet)).toBeTruthy();
        });
    });

    describe("CDS Service Level Testing", () => {
        let srv, Books;

        beforeAll(async () => {
            srv = await cds.serve(serviceName).from(`${__dirname}/../srv/${serviceFileName}`);

            ({ Books } = srv.entities);
        });

        it("should have Books entity", () => {
            // Assert
            expect(Books).toBeDefined();
        });

        it("should not add discount on the title if the stock is below 100", async () => {
            // Arrange
            const expectedBookTitle = "Marvel";
            const bookID = 84
            const book = {
                ID: bookID,
                title: "Marvel",
                stock: 99
            };

            await srv.create(Books, book);

            // Act
            const actualBook = await srv.read(Books, { ID: bookID });

            // Assert
            expect(actualBook).toBeDefined();
            expect(actualBook.title).toEqual(expectedBookTitle);
        });

        it("should add discount on the title if the stock is above 100", async () => {
            // Arrange
            const expectedBookTitle = "Marvel (discount)";
            const bookID = 6;
            const book = {
                ID: bookID,
                title: "Marvel",
                stock: 120
            };

            await srv.create(Books, book);

            // Act
            const actualBook = await srv.read(Books, { ID: bookID });

            // Assert
            expect(actualBook).toBeDefined();
            expect(actualBook.title).toEqual(expectedBookTitle);
        });
    });
});