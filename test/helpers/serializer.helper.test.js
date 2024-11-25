const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require("../../src/helpers/serializer.helper");
const { StatusCodes } = require("http-status-codes");

describe("Helper Functions", () => {
  describe("toCamelCase", () => {
    it("should convert object keys to camel case", () => {
      const input = {
        first_name: "John",
        last_name: "Doe",
        address: {
          street_name: "Main St",
          city_name: "New York",
        },
      };

      const expected = {
        firstName: "John",
        lastName: "Doe",
        address: {
          streetName: "Main St",
          cityName: "New York",
        },
      };

      const result = toCamelCase(input);
      expect(result).toEqual(expected);
    });

    it("should handle arrays correctly", () => {
      const input = [
        { first_name: "John", last_name: "Doe" },
        { first_name: "Jane", last_name: "Smith" },
      ];

      const expected = [
        { firstName: "John", lastName: "Doe" },
        { firstName: "Jane", lastName: "Smith" },
      ];

      const result = toCamelCase(input);
      expect(result).toEqual(expected);
    });

    it("should return the same value for primitive data types", () => {
      expect(toCamelCase("string")).toBe("string");
      expect(toCamelCase(123)).toBe(123);
      expect(toCamelCase(null)).toBeNull();
    });

    it("should avoid circular references", () => {
      const obj = {};
      obj.self = obj; // Circular reference

      const result = toCamelCase(obj);
      expect(result).toEqual({});
    });

    it("should handle deeply nested objects", () => {
      const input = {
        first_name: "John",
        address: {
          street_name: "Main St",
          location: {
            city_name: "New York",
            postal_code: "10001",
          },
        },
      };

      const expected = {
        firstName: "John",
        address: {
          streetName: "Main St",
          location: {
            cityName: "New York",
            postalCode: "10001",
          },
        },
      };

      const result = toCamelCase(input);
      expect(result).toEqual(expected);
    });
  });

  describe("normalizeTimestamps", () => {
    it("should normalize timestamps", () => {
      const input = {
        created_at: "2024-11-01T00:00:00Z",
        updated_at: "2024-11-01T12:00:00Z",
      };

      const expected = {
        createdAt: "2024-11-01T00:00:00Z",
        updatedAt: "2024-11-01T12:00:00Z",
      };
      normalizeTimestamps(input);
    });

    it("should return null for missing timestamps", () => {
      const input = {};

      const expected = {
        createdAt: null,
        updatedAt: null,
      };

      const result = normalizeTimestamps(input);
      expect(result).toEqual(expected);
    });

    it("should handle null input gracefully", () => {
      const result = normalizeTimestamps(null);
      expect(result).toBeNull();
    });
  });

  describe("removeCircularReferences", () => {
    it("should remove circular references from an object", () => {
      const obj = {};
      obj.self = obj; // Circular reference

      const result = removeCircularReferences(obj);
      expect(result).toEqual({});
    });

    it("should return unchanged object if no circular reference", () => {
      const obj = { name: "John", age: 30 };

      const result = removeCircularReferences(obj);
      expect(result).toEqual(obj);
    });

    it("should handle nested circular references", () => {
      const obj1 = {};
      const obj2 = { obj1 };
      obj1.obj2 = obj2;

      const result = removeCircularReferences(obj1);
      expect(result).toEqual({ obj2: {} });
    });

    it("should handle arrays with circular references", () => {
      const arr = [];
      arr.push(arr); // Circular reference

      const result = removeCircularReferences(arr);
      expect(result).toEqual([]);
    });

    it("should handle deeply nested objects with circular references", () => {
      const obj1 = {};
      const obj2 = { obj1 };
      obj1.obj2 = obj2;

      const input = { obj1 };
      const result = removeCircularReferences(input);
      expect(result).toEqual({ obj1: {} });
    });
  });
});
